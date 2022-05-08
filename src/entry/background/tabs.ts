// export const storeActiveTab = async (tabId: number) => {

import { cl, Log, retry } from "./utils";

//     chrome.tabs.get(tabId, (tab) => {
//         console.log(tab)
//         state.activeTab = tab
//         return Promise.resolve()
//     })

// }

export const getActiveTab = async () => {
  return retry(handleGetActiveTab, 100);
};

export const handleGetActiveTab = async () => {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      // 'windowId': chrome.windows.WINDOW_ID_CURRENT
    });
    const tab = tabs[0];
    if (tab) cl(`Active tab is ${tab.url}`, Log.TABS);
    return tab;
  } catch (err) {
    console.log("re", err);
    // FIX Chrome 91 bug or feature: https://stackoverflow.com/questions/67822816/tabs-cannot-be-queried-right-now-user-may-be-dragging-a-tab
    return;
  }
};

export const initTabs = async () => {};
