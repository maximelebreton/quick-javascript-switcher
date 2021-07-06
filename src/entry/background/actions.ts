import {
  getDomainSetting,
  getJavascriptRuleSetting,
  getSubdomainSetting,
  getTabSetting,
  removeJavascriptRule,
  setJavascriptRule,
} from "./contentsettings";
import { updateContextMenus } from "./contextmenus";
import { updateIcon } from "./icon";
import state, { isPausedTab, isPausedTabs } from "./state";
import { clearStorageRules } from "./storage";

import {
  getDomainPatternFromUrl,
  getScopeSetting,
  getSubdomainPatternFromUrl,
  getUrlAsObject,
  getUrlPatternFromUrl,
} from "./utils";

export const handleIconClick = (tab: chrome.tabs.Tab) => {
  //handlePlayPause(tab);
  toggleJavaScript(tab);
};

export const toggleJavaScript = async (tab: chrome.tabs.Tab) => {
  const rule = await getJavascriptRuleSetting({
    primaryUrl: tab.url!,
    incognito: tab.incognito,
  });

  // const blockedSubdomainAndDomain =
  //   (await getSubdomainSetting(tab)) === "block" &&
  //   (await getDomainSetting(tab)) === "block";
  // const blockedSubdomainOnly =
  //   (await getSubdomainSetting(tab)) === "block" &&
  //   (await getDomainSetting(tab)) === "allow";
  // const blockedDomainOnly =
  //   (await getSubdomainSetting(tab)) === "allow" &&
  //   (await getDomainSetting(tab)) === "block";
  // const allowedSubdomainAndDomain =
  //   (await getSubdomainSetting(tab)) === "allow" &&
  //   (await getDomainSetting(tab)) === "allow";

  if (isPausedTab(tab)) {
    handlePlay(tab);
  } else {
    const { subdomain } = await getUrlAsObject(tab.url!);
    const setting = await getTabSetting(tab);

    if (setting === "allow") {
      if (subdomain.length) {
        handleBlockSubdomain(tab);
      } else {
        handleBlockDomain(tab);
      }
    } else {
      if (subdomain.length) {
        handleClearSubdomain(tab);
      } else {
        handleClearDomain(tab);
      }
    }
  }

  // if (blockedSubdomainAndDomain) {
  //   console.log("allow subdomain!");
  //   handleAllowSubdomain(tab);
  //   handleAllowDomain(tab);
  // } else if (blockedSubdomainOnly) {
  //   console.log("allow subdomain!");
  //   handleAllowSubdomain(tab);
  // } else if (blockedDomainOnly) {
  //   console.log("block subdomain!");
  //   handleBlockSubdomain(tab);
  // } else {
  //   console.log("block domain!");
  //   handleBlockDomain(tab);
  // }
};

export const handlePlayPause = (tab: chrome.tabs.Tab) => {
  if (isPausedTab(tab)) {
    handlePlay(tab);
  } else {
    handlePause(tab);
  }
};

export const clearJavascriptRules = () => {
  chrome.contentSettings.javascript.clear({ scope: "regular" }, () => {
    console.info("QJS javascript rules cleared!");
  });
};

export const handleOpenShortcut = () => {
  chrome.tabs.create({
    url: "chrome://extensions/shortcuts",
  });
};

export const handleOpenPopup = (tab: chrome.tabs.Tab) => {
  // chrome.action.setPopup({ popup: "popup.html", tabId: tab.id });
  // console.log("ok");
  const width = 320;
  const height = 532;
  const top = 67;
  chrome.windows.create(
    {
      left: width,
      top: height,
      width: width,
      height: tab.height!,
      type: "popup",
      // url: chrome.runtime.getURL("popup.html"),
      url: "https://buy.stripe.com/cN22bLgrs0qn7uM289",
      focused: true,
    },
    (window) => {
      state.popup = window!;
      chrome.windows.update(window!.id!, {
        left: tab.width! - width,
        top: top,
        width: width + 1,
      });
    }
  );
};
export const handleClear = () => {
  clearJavascriptRules();
};

export const handleClearStorage = () => {
  clearStorageRules();
};
export const handleOpenChromeSettings = () => {
  chrome.tabs.create({
    active: true,
    url: "chrome://settings/content/javascript",
  });
};

export const reloadTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.reload(tab.id!, { bypassCache: false });
};

export const setScriptExecutionDisabled = (
  value: boolean,
  tab: chrome.tabs.Tab,
  callback: any
) => {
  chrome.debugger.sendCommand(
    { tabId: tab.id },
    "Emulation.setScriptExecutionDisabled",
    { value },
    callback
  );
};

export const handlePlay = (tab: chrome.tabs.Tab) => {
  setScriptExecutionDisabled(false, tab, () => {
    if (tab.id) {
      state.tabs[tab.id] = { id: tab.id, paused: false };
    }
    handleDetach(tab);
    updateContextMenus();

    if (!isPausedTabs()) {
      chrome.debugger.detach({ tabId: tab.id }, () => {
        // console.log("detach all");
      });
    }
  });
};

export const handleDetach = (tab: chrome.tabs.Tab) => {
  if (tab.id) {
    delete state.tabs[tab.id];
  }
  updateContextMenus();
  updateIcon(tab);
};

export const handlePause = (tab: chrome.tabs.Tab) => {
  chrome.debugger.attach({ tabId: tab.id }, "1.0", () => {
    chrome.debugger.onDetach.addListener((source, reason) => {
      // console.log("Debugger DETACHED !!!");
      handleDetach(tab);
    });

    setScriptExecutionDisabled(true, tab, () => {
      if (tab.id) {
        state.tabs[tab.id] = { id: tab.id, paused: true };
      }
      updateIcon(tab);
      updateContextMenus();
    });
  });
};

export const handleBlockSubdomain = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block subdomain: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleBlockDomain = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getDomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block domain: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleBlockUrl = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getUrlPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block url: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleAllowSubdomain = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("allow subdomain: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};
export const handleAllowDomain = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getDomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("allow domain: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};
export const handleAllowUrl = (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = `${tab.url}`;
    if (primaryPattern) {
      console.info("allow url: " + primaryPattern);
      setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};

export const handleClearSubdomain = async (tab: chrome.tabs.Tab) => {
  const primaryPattern = getSubdomainPatternFromUrl(tab.url!);
  if (primaryPattern) {
    await removeJavascriptRule({
      primaryPattern,
      scope: getScopeSetting(tab.incognito),
    });
    await updateContextMenus(); //not needed because we update tab
    reloadTab(tab);
  }
};
export const handleClearDomain = async (tab: chrome.tabs.Tab) => {
  const primaryPattern = getDomainPatternFromUrl(tab.url!);
  if (primaryPattern) {
    await removeJavascriptRule({
      primaryPattern,
      scope: getScopeSetting(tab.incognito),
    });
    await updateIcon(tab); //not needed because we update tab
    reloadTab(tab);
  }
};
