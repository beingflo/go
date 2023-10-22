import { Component, createSignal, For, onCleanup, Show } from "solid-js";
import { tinykeys } from "tinykeys";
import Help from "./Help";
import Configuration from "./Configuration";
import { useStore } from "./store";
import { validateEvent } from "./utils";
import Link from "./Link";
import NewLink from "./NewLink";

const App: Component = () => {
  const [state, { toggleHelp, accessLink }] = useStore();
  const [showConfig, setShowConfig] = createSignal(false);
  const [newLinkMode, setNewLinkMode] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedLinkIdx, setSelectedLinkIdx] = createSignal(0);

  let searchInputRef;
  let newLinkInputRef;

  const links = () => {
    const visibleLinks = state.links.filter((link) => !link.deleted);
    const terms = searchTerm().split(" ");
    const filteredLinks = visibleLinks.filter((link) =>
      terms.every(
        (term) => link.url?.includes(term) || link.description?.includes(term)
      )
    );
    filteredLinks.sort((a, b) => b.numAccessed - a.numAccessed);
    return filteredLinks;
  };

  const onEdit = () => {
    setNewLinkMode(true);
    newLinkInputRef?.focus();
  };

  const followLink = (newTab: boolean) => {
    if (newLinkMode()) {
      return;
    }
    const link = links()[selectedLinkIdx()];
    accessLink(link.id);

    if (newTab) {
      window.open(link.url);
    } else {
      location.href = link.url;
    }
  };

  const cleanup = tinykeys(window, {
    n: validateEvent(onEdit),
    Escape: () => {
      setNewLinkMode(false);
      searchInputRef.blur();
    },
    Enter: () => followLink(false),
    "$mod+Enter": () => followLink(true),
    h: validateEvent(toggleHelp),
    c: validateEvent(() => setShowConfig(!showConfig())),
    "g o": validateEvent(() => {
      searchInputRef.focus();
    }),
    ArrowUp: () => setSelectedLinkIdx((oldIdx) => Math.max(oldIdx - 1, 0)),
    ArrowDown: () =>
      setSelectedLinkIdx((oldIdx) => Math.min(oldIdx + 1, links().length - 1)),
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
                ref={searchInputRef}
                class="focus:outline-none w-full text-md placeholder:font-thin block mb-12 border-0 focus:ring-0"
                placeholder="Go somewhere..."
                autofocus
                value={searchTerm()}
                onInput={(event) => setSearchTerm(event?.currentTarget?.value)}
              />
            </form>
            <div class="flex flex-col gap-4">
              <Show when={newLinkMode()}>
                <NewLink
                  ref={newLinkInputRef}
                  onEditEnd={() => setNewLinkMode(false)}
                />
              </Show>
              <For each={links()}>
                {(link, idx) => (
                  <Link
                    id={link.id}
                    url={link.url}
                    description={link.description}
                    lastAccessedAt={link.lastAccessedAt}
                    numAccessed={link.numAccessed}
                    selected={idx() === selectedLinkIdx()}
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
