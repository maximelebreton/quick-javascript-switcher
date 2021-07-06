import state from "./state";

// export const storeActiveTab = async (tabId: number) => {

//     chrome.tabs.get(tabId, (tab) => {
//         console.log(tab)
//         state.activeTab = tab
//         return Promise.resolve()
//     })

// }

export const getActiveTab = async () => {
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
          const time = 100;
          setTimeout(() => {}, time);
        } else {
          var tab = tabs[0];
          return resolve(tab);
        }
      }
    );
  });
};

export const initTabs = async () => {};
