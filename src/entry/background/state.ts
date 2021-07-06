import { getStorage, setStorage } from "./storage";
import { merge, partial } from "lodash";
import deepmerge from "deepmerge";
import { cl, Log } from "./utils";

export type State = {
  contextMenus: { [key: string]: any };
  tabs: {
    [key: number]:
      | {
          id: chrome.tabs.Tab["id"];
          paused: boolean;
        }
      | undefined;
  };
  options: {
    // "showContextMenu": true;
    // "autoRefresh": true;
    useSync: boolean;
  };
  popup: chrome.windows.Window;
};

export const initState = async () => {
  await setState({
    contextMenus: {},
    tabs: {},
    options: {
      // "showContextMenu": true,
      // "autoRefresh": true,
      useSync: true,
    },
    popup: null as unknown as chrome.windows.Window,
  });
};

export const getState = async () => {
  return (await getStorage("state")) as State;
};

export const setState = async (object: State) => {
  await setStorage("state", object);
};

export const updateState = async (partialState: Partial<State>) => {
  const storageState = await getState();
  console.log(storageState, "storageState");
  const mergedState = deepmerge(storageState, partialState) as State;
  await setState(mergedState);
  cl(mergedState, Log.STORAGE, "new state");
};

export const isPausedTab = async (tab: chrome.tabs.Tab) => {
  const state = await getState();
  const isPaused = Object.values(state.tabs).some(
    (stateTab) => stateTab && stateTab.id === tab.id && stateTab.paused === true
  );

  cl(isPaused, undefined, "is paused?");
  return isPaused;
};
export const isPausedTabs = async () => {
  const state = await getState();
  const isPausedTabs = Object.values(state.tabs).some(
    (stateTab) => stateTab && stateTab.paused === true
  );
  cl(isPausedTabs, Log.STORAGE, "IsPausedTabs?");
  return Promise.resolve(isPausedTabs);
};
