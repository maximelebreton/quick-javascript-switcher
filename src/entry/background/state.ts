const state = {
  activeTab: null as unknown as chrome.tabs.Tab,
  contextMenus: {} as { [key: string]: any },
  tabs: {} as {
    [key: number]: {
      id: chrome.tabs.Tab["id"];
      paused: boolean;
    };
  },
  options: {
    // "showContextMenu": true,
    // "autoRefresh": true,
    useSync: true,
  },
  popup: null as unknown as chrome.windows.Window,
};

export const isPausedTab = (tab: chrome.tabs.Tab) => {
  const isPaused = Object.values(state.tabs).some(
    (stateTab) => stateTab.id === tab.id && stateTab.paused === true
  );
  return isPaused;
};
export const isPausedTabs = () => {
  const isPausedTabs = Object.values(state.tabs).some(
    (stateTab) => stateTab.paused === true
  );
  return isPausedTabs;
};

export default state;
