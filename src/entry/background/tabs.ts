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
        chrome.tabs.query({
            'active': true,
            'windowId': chrome.windows.WINDOW_ID_CURRENT
          }, async (tabs) => {
            var tab = tabs[0];
                
            return resolve(tab)
          })
    }) 
}

export const initTabs = async () => {

    
    
}