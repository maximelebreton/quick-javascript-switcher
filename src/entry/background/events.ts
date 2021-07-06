import { handleIconClick, reloadTab } from "./actions";
import { handleContextMenu, updateContextMenus } from "./contextmenus";
import { updateIcon } from "./icon";
import state from "./state";
import { getStorageRules } from "./storage";
import { getActiveTab } from "./tabs";

// export const handleUpdates = async () => {
//   await updateContextMenus();
// };

export const initEvents = () => {
  // On active tab
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    //console.info("onHighlighted");
    // storeTabSettings()
    console.info("tab activated!");
    await updateContextMenus();
    chrome.tabs.get(tabId, async (tab) => {
      await updateIcon(tab);
    });
  });

  // On Tab update
  chrome.tabs.onUpdated.addListener(async (tabId, props, tab) => {
    console.info("tab updated!");
    // Prevent multiple calls
    if (props.status === "loading" && tab.selected) {
      console.info("tab updated 2!");
      //console.info("onUpdated");
      await updateContextMenus();
      await updateIcon(tab);
    }
  });

  // On Window changes
  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    console.info("window focus changed!");
    await updateContextMenus();

    if (state && state.popup) {
      // CLOSE POPUP
      // chrome.windows.get(state.popup.id, (window) => {
      //   console.log(window);
      //   if (window.focused === false) {
      //     chrome.windows.remove(window.id);
      //   }
      // });
    }
  });

  // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {});

  chrome.runtime.onInstalled.addListener(async () => {
    await updateContextMenus();
    const tab = await getActiveTab();
    await updateIcon(tab);
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab) {
      handleContextMenu(info, tab);
    }
  });

  chrome.action.onClicked.addListener((tab) => {
    if (tab) {
      handleIconClick(tab);
    }
  });
};
