import { getActiveTab } from "./tabs";
import { getJavascriptRuleSetting } from "./contentsettings";
import { getScopeSetting, getUrlAsObject, isValidScheme } from "./utils";
import state from "./state";

export const updateIcon = async (tab: chrome.tabs.Tab) => {
  if (tab && tab.url) {
    const ruleSetting = await getJavascriptRuleSetting({
      primaryUrl: tab.url,
      incognito: tab.incognito,
    });

    // chrome.debugger.getTargets((result) => {
    //   const attachedTarget = result.find(
    //     (target) => target.tabId === tab.id && target.attached === true
    //   );
    //   console.log(attachedTarget);
    // });

    const isPaused = Object.values(state.tabs).some(
      (stateTab) => stateTab.id === tab.id && stateTab.paused === true
    );
    const { scheme } = getUrlAsObject(tab.url!);

    if (isPaused) {
      chrome.browserAction.setIcon({
        path: "icons/paused.png",
        tabId: tab.id,
      });
    } else if (!isValidScheme(scheme)) {
      chrome.browserAction.setIcon({
        path: "icons/disabled.png",
        tabId: tab.id,
      });
    } else {
      chrome.browserAction.setIcon({
        path: "icons/" + ruleSetting + "@2x.png",
        tabId: tab.id,
      });
    }
  }
};
