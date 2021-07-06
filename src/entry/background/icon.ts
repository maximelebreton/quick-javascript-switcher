import { getJavascriptRuleSetting } from "./contentsettings";
import { isPausedTab } from "./state";
import {
  cl,
  getScopeSetting,
  getUrlAsObject,
  isValidScheme,
  Log,
} from "./utils";

export const updateIcon = async (tab: chrome.tabs.Tab) => {
  cl("ICON UPDATED", Log.ICON);
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

    const isPaused = await isPausedTab(tab);

    const { scheme } = getUrlAsObject(tab.url!);

    if (isPaused) {
      chrome.action.setIcon({
        path: "icons/paused.png",
        tabId: tab.id,
      });
    } else if (!isValidScheme(scheme)) {
      chrome.action.setIcon({
        path: "icons/disabled.png",
        tabId: tab.id,
      });
    } else {
      chrome.action.setIcon({
        path: "icons/" + ruleSetting + "@2x.png",
        tabId: tab.id,
      });
    }
  }
  return Promise.resolve();
};
