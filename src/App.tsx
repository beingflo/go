import { Component, createSignal, For, onCleanup, Show } from "solid-js";
import { tinykeys } from "tinykeys";
import Help from "./Help";
import Configuration from "./Configuration";
import { useStore } from "./store";
import { validateEvent } from "./utils";
import Link from "./Link";
import NewLink from "./NewLink";
import { s3Sync } from "./s3-utils";

const App: Component = () => {
  const [state, { toggleHelp, accessLink }] = useStore();
  const [showConfig, setShowConfig] = createSignal(false);
  const [newLinkMode, setNewLinkMode] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [editLink, setEditLink] = createSignal(null);
  const [selectedLinkIdx, setSelectedLinkIdx] = createSignal(0);

  let searchInputRef;
  let newLinkInputRef;

  const syncState = () => {
    s3Sync(state);
  };

  document.addEventListener("visibilitychange", syncState);

  onCleanup(() => document.removeEventListener("visibilitychange", syncState));

  const urlParams = new URLSearchParams(window.location.search);
  const searchUrlParam = urlParams.get("q");

  const links = () => {
    const visibleLinks = state.links?.filter((link) => !link.deleted) ?? [];
    const terms = searchTerm()?.split(" ");
    const filteredLinks = visibleLinks?.filter((link) =>
      terms.every(
        (term) => link.url?.includes(term) || link.description?.includes(term)
      )
    );
    filteredLinks?.sort((a, b) => b.numAccessed - a.numAccessed);
    return filteredLinks;
  };

  const onNew = () => {
    setNewLinkMode(true);
    newLinkInputRef?.focus();
  };

  const followLink = (newTab: boolean) => {
    if (newLinkMode() || editLink()) {
      return;
    }
    const link = links()[selectedLinkIdx()];
    accessLink(link?.id);

    if (!link) {
      return;
    }

    if (newTab) {
      window.open(link?.url);
      setSearchTerm("");
    } else {
      location.href = link?.url;
    }
  };

  if (searchUrlParam) {
    setSearchTerm(searchUrlParam);
    if (links().length === 1) {
      followLink(false);
    }
  }

  const cleanup = tinykeys(window, {
    n: validateEvent(onNew),
    Escape: () => {
      setNewLinkMode(false);
      setEditLink(null);
      searchInputRef.blur();
    },
    Enter: () => followLink(false),
    "$mod+Enter": () => followLink(true),
    h: validateEvent(toggleHelp),
    c: validateEvent(() => setShowConfig(!showConfig())),
    "$mod+k": validateEvent(() => {
      searchInputRef.focus();
    }),
    ArrowUp: (event) => {
      setSelectedLinkIdx((oldIdx) => Math.max(oldIdx - 1, 0));
      event.preventDefault();
    },
    ArrowDown: (event) => {
      setSelectedLinkIdx((oldIdx) => Math.min(oldIdx + 1, links().length - 1));
      event.preventDefault();
    },
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
                onInput={(event) => {
                  setSearchTerm(event?.currentTarget?.value);
                  setSelectedLinkIdx(0);
                }}
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
                  <Show
                    when={link.id === editLink()?.id}
                    fallback={
                      <Link
                        id={link.id}
                        url={link.url}
                        description={link.description}
                        lastAccessedAt={link.lastAccessedAt}
                        numAccessed={link.numAccessed}
                        selected={idx() === selectedLinkIdx()}
                        onEdit={(link) => {
                          setEditLink(link);
                        }}
                      />
                    }
                  >
                    <NewLink
                      ref={newLinkInputRef}
                      editLink={editLink()}
                      onEditEnd={() => {
                        setEditLink(null);
                      }}
                    />
                  </Show>
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
