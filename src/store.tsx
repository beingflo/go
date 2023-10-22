import { createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export const getNewId = () => crypto.randomUUID();

export const storeName = "store";

const StoreContext = createContext({});

const localState = localStorage.getItem(storeName);

export const [state, setState] = createStore(
  localState ? JSON.parse(localState) : { version: 0 }
);

export function StoreProvider(props) {
  createEffect(() => localStorage.setItem(storeName, JSON.stringify(state)));

  const store = [
    state,
    {
      toggleHelp() {
        setState({ help: !state.help });
      },
      setS3Config(config: Object) {
        setState({ s3: config });
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
              deleted: false,
            },
          ],
          version: state.version + 1,
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
