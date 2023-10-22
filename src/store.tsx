import { createContext, createEffect, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

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
