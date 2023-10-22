import { Component, createSignal, onCleanup, Show } from "solid-js";
import { tinykeys } from "tinykeys";
import Help from "./Help";
import Configuration from "./Configuration";
import { useStore } from "./store";
import { validateEvent } from "./utils";

const App: Component = () => {
  const [state, { toggleHelp }] = useStore();
  const [showConfig, setShowConfig] = createSignal(false);

  const cleanup = tinykeys(window, {
    h: validateEvent(toggleHelp),
    c: validateEvent(() => setShowConfig(!showConfig())),
  });

  onCleanup(cleanup);

  return (
    <Show when={false} fallback={<Help />}>
      <Show when={!showConfig()} fallback={<Configuration />}>
        <div>test</div>
      </Show>
    </Show>
  );
};

export default App;
