import { AwsClient } from "aws4fetch";
import { setState } from "./store";

type Index = { version: number };

const IndexFile = "index.json";
const StateFile = "state.json";

export const s3Sync = async (state: any) => {
  if (!state?.s3) {
    console.info("No credentials for syncing");
    return;
  }

  const aws = new AwsClient({
    accessKeyId: state?.s3?.apiKey,
    secretAccessKey: state?.s3?.apiSecretKey,
    service: "s3",
    region: state?.s3?.region,
  });

  const indexResponse = await aws.fetch(`${state?.s3?.endpoint}${IndexFile}`, {
    method: "GET",
  });
  const remoteIndex: Index =
    indexResponse.status === 200 ? await indexResponse.json() : [];

  if (state.version === remoteIndex.version) {
    // No need to sync
    console.info("No sync");

    return;
  } else if (state.version > remoteIndex.version || !remoteIndex.version) {
    // We have newer state
    console.info("Sync local state");

    await aws.fetch(`${state?.s3?.endpoint}${IndexFile}`, {
      method: "PUT",
      body: JSON.stringify({ version: state.version }),
    });

    await aws.fetch(`${state?.s3?.endpoint}${StateFile}`, {
      method: "PUT",
      body: JSON.stringify({
        links: state.links,
      }),
    });
  } else {
    // Remote has newer state
    console.info("Sync remote state");

    const linksResponse = await aws.fetch(
      `${state?.s3?.endpoint}${StateFile}`,
      {
        method: "GET",
      }
    );
    const links =
      linksResponse.status === 200 ? await linksResponse.json() : {};

    setState({
      ...links,
      version: remoteIndex.version,
    });
  }
};
