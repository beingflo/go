import { createContext, createEffect, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { s3Sync } from "./s3-utils";
import { setEphemeralStore } from "./ephemeralStore";

export const getNewId = () => crypto.randomUUID();

export const storeName = "store";

const StoreContext = createContext({});

const localState = localStorage.getItem(storeName);

export const [state, setState] = createStore(
  localState ? JSON.parse(localState) : {}
);

export function StoreProvider(props) {
  createEffect(() => localStorage.setItem(storeName, JSON.stringify(state)));

  const store = [
    state,
    {
      cycleScreen(screen: "help" | "config" | "app" | "import") {
        const currentScreen = state.screen;
        let newScreen = "app";
        if (currentScreen !== screen) {
          newScreen = screen;
        }
        setState({ screen: newScreen });
      },
      setS3Config(config: Object) {
        setState({ s3: config });
      },
      accessLink(id: string) {
        setState(
          produce((state: any) => {
            state.links.forEach((link) => {
              if (link.id === id) {
                link.numAccessed += 1;
                link.lastAccessedAt = Date.now();
              }
            });
          })
        );
      },
      newLink(url: string, description: string) {
        setState({
          links: [
            ...(state.links ?? []),
            {
              id: getNewId(),
              url,
              description,
              createdAt: Date.now(),
              lastAccessedAt: null,
              numAccessed: 0,
              deletedAt: null,
            },
          ],
        });
      },
      updateLink(id: string, url: string, description: string) {
        setState(
          produce((state: any) => {
            state.links.forEach((link) => {
              if (link.id === id) {
                link.url = url;
                link.description = description;
                link.lastAccessedAt = Date.now();
              }
            });
          })
        );
      },
      deleteLink(id: string) {
        setState(
          produce((state: any) => {
            state.links.forEach((link) => {
              if (link.id === id) {
                link.deletedAt = Date.now();
                link.lastAccessedAt = Date.now();
              }
            });
          })
        );
      },
      async syncState() {
        const [newLocal, newRemote, droppedLocal, droppedRemote] = await s3Sync(
          state
        );

        setTimeout(() => setEphemeralStore({ showToast: false }), 4000);

        setEphemeralStore({
          new: [newLocal, newRemote] ?? [0, 0],
          dropped: [droppedLocal, droppedRemote] ?? [0, 0],
          showToast: true,
        });
      },
    },
  ];

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext) as any;
}
