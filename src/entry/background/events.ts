import { handleIconClick, reloadTab } from "./actions";
import { handleContextMenu, updateContextMenus } from "./contextmenus";
import { updateIcon } from "./icon";

import { getStorageRules } from "./storage";
import { getActiveTab } from "./tabs";
import { cl, Log } from "./utils";

// export const handleUpdates = async () => {
//   await updateContextMenus();
// };

export const initEvents = () => {
  // On active tab
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    //console.info("onHighlighted");
    // storeTabSettings()

    cl("ON TAB ACTIVATED", Log.EVENTS);
    await updateContextMenus();
    console.log("UPDATE CONTEXT MENUS FINISHED");
    chrome.tabs.get(tabId, async (tab) => {
      await updateIcon(tab);
    });
  });

  // On Tab update
  chrome.tabs.onUpdated.addListener(async (tabId, props, tab) => {
    cl("ON TAB UPDATED", Log.EVENTS);
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
    cl("ON WINDOW FOCUS CHANGED", Log.EVENTS);
    await updateContextMenus();

    // if (state && state.popup) {
    // CLOSE POPUP
    // chrome.windows.get(state.popup.id, (window) => {
    //   console.log(window);
    //   if (window.focused === false) {
    //     chrome.windows.remove(window.id);
    //   }
    // });
    // }
  });

  // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {});

  chrome.runtime.onInstalled.addListener(async () => {
    await updateContextMenus();
    const tab = await getActiveTab();
    await updateIcon(tab);
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    cl("ON CONTEXT MENU CLICKED", Log.EVENTS);
    if (tab) {
      handleContextMenu(info, tab);
    }
  });

  chrome.action.onClicked.addListener(async (tab) => {
    cl("ON ACTION CLICKED", Log.EVENTS);
    if (tab) {
      await handleIconClick(tab);
    }
  });
};
