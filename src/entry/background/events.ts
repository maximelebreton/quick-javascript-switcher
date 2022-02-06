import { handleIconClick, reloadTab } from "./actions";
import { ACTION_SHORTCUT_NAME } from "./constants";
import { rebaseJavascriptSettingsFromStorage } from "./contentsettings";
import { handleContextMenu, updateContextMenus } from "./contextmenus";
import { updateIcon } from "./icon";

import {
  convertOldRulesToNew,
  getStorageRules,
  QJS,
  setStorage,
} from "./storage";
import { getActiveTab } from "./tabs";
import { cl, Log } from "./utils";
import satisfies from "semver/functions/satisfies";

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

  const handleUpdateFromV1toV2 = async () => {
    const currentRules = await getStorageRules();
    if (Array.isArray(currentRules)) {
      const convertedRules = convertOldRulesToNew(currentRules);
      await setStorage("rules", convertedRules);
    }
  };

  chrome.runtime.onInstalled.addListener(async (details) => {
    await updateContextMenus();
    const tab = await getActiveTab();
    await updateIcon(tab);

    // Check whether new version is installed
    if (details.reason == "install") {
      //console.log("First install!");
    } else if (details.reason == "update") {
      const currentVersion = chrome.runtime.getManifest().version;
      const isFromV1ToV2 =
        details.previousVersion &&
        satisfies(details.previousVersion, "<2.0.0") &&
        satisfies(currentVersion, ">=2.0.0");

      if (isFromV1ToV2) {
        console.log(
          `Updated from ${details.previousVersion} to ${currentVersion}, trying to convert existing rules.`
        );
        await handleUpdateFromV1toV2();
      }
    }
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

  chrome.commands.onCommand.addListener(async (command, tab) => {
    cl(command, Log.EVENTS);
    if (command === ACTION_SHORTCUT_NAME) {
      if (tab) {
        await handleIconClick(tab);
      }
    }
  });

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (changes.rules) {
      console.log(changes, "rules changes");
      console.log(areaName, "areaname");
      const { newValue, oldValue } = changes;

      if (newValue !== oldValue) {
        await rebaseJavascriptSettingsFromStorage();
      }
    }
  });

  //@ts-ignore
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.popupOpen === true) {
      console.log("it's working !");
    }
    if (message.popupOpen === false) {
      console.log("Popup closed");
    }
  });

  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popup") {
      port.onDisconnect.addListener(function () {
        console.log("popup has been closed");
      });
    }
  });
};

export const askForTabsPermission = () => {
  chrome.permissions.contains(
    {
      permissions: ["tabs"],
    },
    function (result) {
      if (result) {
        // The extension has the permissions.
        console.log("Already have tabs permission!", result);
      } else {
        chrome.permissions.request(
          {
            permissions: ["tabs"],
          },
          function (granted) {
            // The callback argument will be true if the user granted the permissions.
            if (granted) {
              console.log("Permission granted!", granted);
            } else {
              console.log("Permission declined...", granted);
            }
          }
        );
      }
    }
  );
};
