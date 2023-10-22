import { Component, createSignal, For, onCleanup, Show } from "solid-js";
import { tinykeys } from "tinykeys";
import Help from "./Help";
import Configuration from "./Configuration";
import { useStore } from "./store";
import { validateEvent } from "./utils";
import Link from "./Link";
import NewLink from "./NewLink";

const App: Component = () => {
  const [state, { toggleHelp }] = useStore();
  const [showConfig, setShowConfig] = createSignal(false);
  const [newLinkMode, setNewLinkMode] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");

  const onEdit = () => {
    setNewLinkMode(true);
  };

  const cleanup = tinykeys(window, {
    n: validateEvent(onEdit),
    Escape: () => setNewLinkMode(false),
    h: validateEvent(toggleHelp),
    c: validateEvent(() => setShowConfig(!showConfig())),
  });

  onCleanup(cleanup);

  return (
    <Show when={state.help} fallback={<Help />}>
      <Show when={!showConfig()} fallback={<Configuration />}>
        <div class="flex flex-col w-full p-2 md:p-4">
          <div class="w-full max-w-8xl mx-auto">
            <form onSubmit={(event) => event.preventDefault()}>
              <input
                type="text"
                class="focus:outline-none w-full text-md placeholder:font-thin block mb-12 border-0 focus:ring-0"
                placeholder="Go somewhere..."
                autofocus
                value={searchTerm()}
                onChange={(event) => setSearchTerm(event?.currentTarget?.value)}
              />
            </form>
            <div class="flex flex-col gap-2">
              <Show when={newLinkMode()}>
                <NewLink onEditEnd={() => setNewLinkMode(false)} />
              </Show>
              <For each={state.links?.filter((link) => !link.deleted)}>
                {(link) => (
                  <Link
                    id={link.id}
                    url={link.url}
                    description={link.description}
                    lastAccessedAt={link.lastAccessedAt}
                    numAccessed={link.numAccessed}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default App;
