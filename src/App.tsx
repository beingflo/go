import { Component, createSignal, onCleanup, Show } from "solid-js";
import { tinykeys } from "tinykeys";
import Help from "./Help";
import Configuration from "./Configuration";
import { useStore } from "./store";
import { validateEvent } from "./utils";
import Link from "./Link";

const App: Component = () => {
  const [state, { toggleHelp }] = useStore();
  const [showConfig, setShowConfig] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");

  const cleanup = tinykeys(window, {
    h: validateEvent(toggleHelp),
    c: validateEvent(() => setShowConfig(!showConfig())),
  });

  onCleanup(cleanup);

  return (
    <Show when={state.help} fallback={<Help />}>
      <Show when={!showConfig()} fallback={<Configuration />}>
        <div class="flex flex-col w-full p-2 md:p-4">
          <div class="w-full max-w-8xl mx-auto">
            <input
              type="text"
              class="focus:outline-none text-2xl block mb-12 border-0 placeholder-[#392c084e] focus:ring-0"
              placeholder="Go somewhere"
              value={searchTerm()}
              onChange={(event) => setSearchTerm(event?.currentTarget?.value)}
            />
            <div class="flex flex-col gap-2">
              <Link
                title="my website"
                url="https://marending.dev"
                createdAt="21-05-1994"
                lastAccessedAt="10-10-2023"
                numAccessed={123}
                selected={true}
              />
              <Link
                title="Check dns propagation"
                url="https://www.whatsmydns.net/"
                createdAt="21-05-1994"
                lastAccessedAt="10-10-2023"
                numAccessed={13}
                selected={false}
              />
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default App;
