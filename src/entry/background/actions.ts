import {

  clearJavascriptRule,
  getTabSetting,
  removeConflictedRulesFromPattern,
  removeJavascriptRule,
  setJavascriptRule,
} from "./contentsettings";
import { updateContextMenus } from "./contextmenus";
import { askForTabsPermission } from "./events";
import { updateIcon } from "./icon";
import { getState, isPausedTab, isPausedTabs, setTabsState } from "./state";
import { clearStorageRules } from "./storage";
import { getActiveTab } from "./tabs";
import { cl, Log } from "./utils";

import {
  getDomainPatternFromUrl,
  getScopeSetting,
  getSubdomainPatternFromUrl,
  getUrlAsObject,
  getUrlPatternFromUrl,
} from "./utils";

export const handleIconClick = async (tab: chrome.tabs.Tab) => {
  //handlePlayPause(tab);

  await toggleJavaScript(tab);
};

export const toggleJavaScript = async (tab: chrome.tabs.Tab) => {
  cl("Toggle JavaScript", Log.ACTIONS);
  // const rule = await getJavascriptRuleSetting({
  //   primaryUrl: tab.url!,
  //   incognito: tab.incognito,
  // });

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

  if (await isPausedTab(tab)) {
    await handlePlay(tab);
  } else {
    const { subdomain, scheme } = await getUrlAsObject(tab.url!);
    const setting = await getTabSetting(tab);
    cl(`setting for ${tab.url} : ${setting}`, Log.ACTIONS);

    if (scheme === "file") {
      await handleToggleUrl(tab);
    } else {
      if (subdomain.length) {
        await handleToggleSubdomain(tab);
      } else {
        await handleToggleDomain(tab);
      }
    }

    // if (setting === "allow") {
    //   if (scheme === "file") {
    //     await handleBlockUrl(tab);
    //   } else {
    //     if (subdomain.length) {
    //       await handleBlockSubdomain(tab);
    //     } else {
    //       await handleBlockDomain(tab);
    //     }
    //   }
    // } else {
    //   if (scheme === "file") {
    //     await handleAllowUrl(tab);
    //   } else {
    //     if (subdomain.length) {
    //       if (tab.incognito === true) {
    //         await handleAllowSubdomain(tab);
    //       } else {
    //         await handleClearSubdomain(tab);
    //       }
    //     } else {
    //       if (tab.incognito === true) {
    //         await handleAllowDomain(tab);
    //       } else {
    //         await handleClearDomain(tab);
    //       }
    //     }
    //   }
    // }
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

export const handlePlayPause = async (tab: chrome.tabs.Tab) => {
  if (await isPausedTab(tab)) {
    await handlePlay(tab);
  } else {
    await handlePause(tab);
  }
};

export const clearJavascriptRules = () => {
  chrome.contentSettings.javascript.clear({ scope: "regular" }, async () => {
    console.info("QJS javascript rules cleared!");
    await updateContextMenus();
    const tab = await getActiveTab();
    await updateIcon(tab);
  });
};

export const handleOpenShortcut = () => {
  chrome.tabs.create({
    url: "chrome://extensions/shortcuts",
  });
};

export const handleOpenPopup = async (tab: chrome.tabs.Tab) => {
  // chrome.action.setPopup({ popup: "popup.html", tabId: tab.id });
  // console.log("ok");
  const width = 420;
  const height = 532;
  const top = 67;
  const state = getState.value;
  chrome.windows.create(
    {
      left: width,
      top: height,
      width: width,
      height: tab.height ?? height,
      type: "popup",
      // url: chrome.runtime.getURL("popup.html"),
      url: "https://donate.stripe.com/14k03Dcbca0XaGY3cn",
      focused: true,
    },
    (window) => {
      state.popup = window!;
      chrome.windows.update(
        window!.id!,
        {
          left: (tab.width ?? width) - width,
          top: top,
          width: width + 1,
        },
        () => {
          return Promise.resolve();
        }
      );
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

export const handleOpenLinkWithJSDisabled = async (
  tab: chrome.tabs.Tab,
  info: chrome.contextMenus.OnClickData
) => {
  const url = info.linkUrl;
  const { subdomain } = await getUrlAsObject(url!);
  const primaryPattern = subdomain.length
    ? getSubdomainPatternFromUrl(url!)
    : getDomainPatternFromUrl(url!);

  if (primaryPattern) {
    console.info("Block opened link: " + primaryPattern);
    await setJavascriptRule({
      primaryPattern,
      scope: getScopeSetting(tab.incognito),
      setting: "block",
    });
    chrome.tabs.create({
      active: true,
      url: info.linkUrl,
      // openerTabId: tab.id, // not useful?
    });
  }
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

export const handlePlay = async (tab: chrome.tabs.Tab) => {
  cl("HANDLE PLAY", Log.ACTIONS);
  setScriptExecutionDisabled(false, tab, async () => {
    if (tab.id) {
      // state.tabs[tab.id] = { id: tab.id, paused: false };
      await setTabsState({ [tab.id]: { id: tab.id, paused: false } });
    }
    handleDetach(tab);
    await updateContextMenus();

    if ((await isPausedTabs()) === false) {
      chrome.debugger.detach({ tabId: tab.id }, () => {
        console.log("detach all");
        return Promise.resolve();
      });
    } else {
      return Promise.resolve();
    }
  });
};

export const handleDetach = async (tab: chrome.tabs.Tab) => {
  if (tab.id) {
    // delete state.tabs[tab.id];
    await setTabsState({ [tab.id]: undefined });
  }
  await updateContextMenus();
  await updateIcon(tab);
};

export const handlePause = async (tab: chrome.tabs.Tab) => {
  cl("HANDLE PAUSE", Log.ACTIONS);
  chrome.debugger.attach({ tabId: tab.id }, "1.0", () => {
    chrome.debugger.onDetach.addListener(async (source, reason) => {
      // console.log("Debugger DETACHED !!!");
      await handleDetach(tab);
    });

    setScriptExecutionDisabled(true, tab, async () => {
      if (tab.id) {
        // state.tabs[tab.id] = { id: tab.id, paused: true };
        await setTabsState({ [tab.id]: { id: tab.id, paused: true } });
      }
      await updateIcon(tab);
      await updateContextMenus();
    });
  });
};

export const hanleToggleByPattern = async (tab: chrome.tabs.Tab, primaryPattern: string) => {

  if (tab.url) {
    const oldSetting = await getTabSetting(tab)
    const newSetting = oldSetting === 'allow' ? 'block' : 'allow'

    if (!primaryPattern) {
      return
    }
    await removeConflictedRulesFromPattern(primaryPattern)

    console.info(`toggle from ${oldSetting} to ${newSetting}: ` + primaryPattern);
    await setJavascriptRule({
      primaryPattern,
      scope: getScopeSetting(tab.incognito),
      setting: newSetting,
      tab,
    });
    

  }

}

export const handleToggleSubdomain = async (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      await hanleToggleByPattern(tab, primaryPattern)
    }
  }
}

export const handleToggleDomain = async (tab: chrome.tabs.Tab) => {
    if (tab.url) {
      const primaryPattern = getDomainPatternFromUrl(tab.url);
      if (primaryPattern) {
        await hanleToggleByPattern(tab, primaryPattern)
      }
    }
};    

export const handleToggleUrl = async (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getUrlPatternFromUrl(tab.url);
    await hanleToggleByPattern(tab, primaryPattern)
  }
}; 

export const handleBlockSubdomain = async (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block subdomain: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleBlockDomain = async (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getDomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block domain: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleBlockUrl = async (tab: chrome.tabs.Tab) => {
  if (tab.url) {
    const primaryPattern = getUrlPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("block url: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "block",
        tab,
      });
    }
  }
};
export const handleAllowSubdomain = async (tab: chrome.tabs.Tab) => {
  cl("ALLOW SUBDOMAIN", Log.ACTIONS);
  if (tab.url) {
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("allow subdomain: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};
export const handleAllowDomain = async (tab: chrome.tabs.Tab) => {
  cl("ALLOW DOMAIN", Log.ACTIONS);
  if (tab.url) {
    const primaryPattern = getDomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      console.info("allow domain: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};
export const handleAllowUrl = async (tab: chrome.tabs.Tab) => {
  cl("ALLOW URL", Log.ACTIONS);
  if (tab.url) {
    const primaryPattern = `${tab.url}`;
    if (primaryPattern) {
      console.info("allow url: " + primaryPattern);
      await setJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        setting: "allow",
        tab,
      });
    }
  }
};

export const handleClearSubdomain = async (tab: chrome.tabs.Tab) => {
  cl("CLEAR SUBDOMAIN", Log.ACTIONS);
  if (tab.url) {
    
    const primaryPattern = getSubdomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      await clearJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        tab
      });
      // await updateContextMenus(); //not needed because we update tab
      reloadTab(tab);
    }
  }
};
export const handleClearDomain = async (tab: chrome.tabs.Tab) => {
  cl("CLEAR DOMAIN", Log.ACTIONS);
  if (tab.url) {
    const primaryPattern = getDomainPatternFromUrl(tab.url);
    if (primaryPattern) {
      await clearJavascriptRule({
        primaryPattern,
        scope: getScopeSetting(tab.incognito),
        tab
      });
      // await updateIcon(tab); //not needed because we update tab
      reloadTab(tab);
    }
  }
};


export const handleOpenV2UpdatePage = () => {
    chrome.windows.create({
        url: 'https://maximelebreton.github.io/quick-javascript-switcher/',
        type: "popup",
        width: 980 + 32,
        height: 720,
    });
}