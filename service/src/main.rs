use std::{env, time::Duration};

use axum::{
    body::Body,
    http::{header::CACHE_CONTROL, HeaderValue, Request, Response},
    Router,
};
use dotenv::dotenv;
use tokio::signal;
use tower_http::{
    classify::ServerErrorsFailureClass,
    services::{ServeDir, ServeFile},
    set_header::SetResponseHeaderLayer,
    trace::TraceLayer,
};
use tracing::{error, info, Span};
use tracing_subscriber::{filter::LevelFilter, layer::SubscriberExt, util::SubscriberInitExt, Layer};
use uuid::Uuid;

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    // Set up tracing with console output
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer().with_filter(LevelFilter::INFO),
        )
        .init();

    let port = match env::var("SERVE_PORT") {
        Ok(port) => port.parse::<u16>().unwrap_or_else(|_| {
            error!(message = "SERVE_PORT is not a valid port", port);
            panic!()
        }),
        Err(_) => 3000,
    };

    // Vite hashes asset names, so their contents never change. Everything else
    // (index.html, public files) must revalidate.
    let assets = Router::new()
        .fallback_service(
            ServeDir::new("ui/assets")
                .precompressed_gzip()
                .precompressed_br(),
        )
        .layer(SetResponseHeaderLayer::overriding(
            CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=31536000, immutable"),
        ));
    let pages = Router::new()
        .fallback_service(
            ServeDir::new("ui")
                .precompressed_gzip()
                .precompressed_br()
                .fallback(ServeFile::new("ui/index.html")),
        )
        .layer(SetResponseHeaderLayer::overriding(
            CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=0, must-revalidate"),
        ));

    let app = Router::new()
        .nest_service("/assets", assets)
        .fallback_service(pages)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|_request: &Request<Body>| {
                    let request_id = Uuid::new_v4().to_string();
                    tracing::info_span!("http-request", %request_id)
                })
                .on_request(|request: &Request<Body>, _span: &Span| {
                    info!(
                        message = "request",
                        request = request.method().as_str(),
                        uri = request.uri().path().to_string(),
                        referrer = request
                            .headers()
                            .get("referer")
                            .and_then(|v| v.to_str().ok())
                            .unwrap_or(""),
                        user_agent = request
                            .headers()
                            .get("user-agent")
                            .and_then(|v| v.to_str().ok())
                            .unwrap_or("")
                    )
                })
                .on_response(
                    |response: &Response<Body>, latency: Duration, _span: &Span| {
                        info!(
                            message = "response_status",
                            status = response.status().as_u16(),
                            latency = latency.as_nanos()
                        )
                    },
                )
                .on_failure(
                    |error: ServerErrorsFailureClass, _latency: Duration, _span: &Span| {
                        error!(message = "error", error = error.to_string())
                    },
                ),
        );

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .unwrap();

    info!(message = "Starting server", port);
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install SIGTERM handler")
            .recv()
            .await;
    };

    tokio::select! {
        _ = ctrl_c => {
            info!("Ctrl+C received, shutting down")
        },
        _ = terminate => {
            info!("SIGTERM received, shutting down")
        },
    }
}
