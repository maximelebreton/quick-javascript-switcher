import { getStorage, setStorage } from "./storage";
// import { merge, partial } from "lodash";
import deepmerge from "deepmerge";
import { cl, Log } from "./utils";
import { computed, reactive, watch } from "vue";

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

  popup: chrome.windows.Window;
};

export const state = reactive<State>({
  contextMenus: {},
  tabs: {},
  popup: null as unknown as chrome.windows.Window,
});

export const getState = computed(() => state);

export const getTabsState = computed(() => state.tabs);

export const setTabsState = (tabs: State["tabs"]) => {
  state.tabs = tabs;
};

// export const updateState = async (partialState: Partial<State>) => {
//   const storageState = await getState();
//   console.log(storageState, "storageState");
//   const mergedState = deepmerge(storageState, partialState) as State;
//   await setState(mergedState);
//   cl(mergedState, Log.STORAGE, "new state");
// };

export const isPausedTab = async (tab: chrome.tabs.Tab) => {
  const state = getState.value;
  const isPaused = Object.values(state.tabs).some(
    (stateTab) => stateTab && stateTab.id === tab.id && stateTab.paused === true
  );

  cl(isPaused, undefined, "is paused?");
  return isPaused;
};
export const isPausedTabs = async () => {
  const state = getState.value;
  const isPausedTabs = Object.values(state.tabs).some(
    (stateTab) => stateTab && stateTab.paused === true
  );
  cl(isPausedTabs, Log.STORAGE, "IsPausedTabs?");
  return Promise.resolve(isPausedTabs);
};
