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
  return new Promise<chrome.tabs.Tab>((resolve, reject) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
        // 'windowId': chrome.windows.WINDOW_ID_CURRENT
      },
      async (tabs) => {
        // FIX Chrome 91 bug or feature: https://stackoverflow.com/questions/67822816/tabs-cannot-be-queried-right-now-user-may-be-dragging-a-tab
        if (chrome.runtime.lastError) {
          console.log("re");
          return reject();
        } else {
          var tab = tabs[0];
          if (tab) {
            cl(`Active tab is ${tab.url}`, Log.TABS);
            return resolve(tab);
          }
        }
      }
    );
  });
};

export const initTabs = async () => {};
