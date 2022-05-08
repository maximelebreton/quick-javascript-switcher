import { clearJavascriptRules, reloadTab } from "./actions";
import { cl, isAllowedPattern, Log } from "./utils";
import { updateIcon } from "./icon";
import {
  getStorageRules,
  QJS,
  setStorageRule,
  unsetStorageRule,
} from "./storage";
import { getUrlAsObject } from "./utils";

export type RuleSetting = "allow" | "block";

export const getTabSetting = async (tab: chrome.tabs.Tab) => {
  const setting = await getJavascriptRuleSetting({
    primaryUrl: tab.url!,
    incognito: tab.incognito,
  });
  return setting;
};

export const getJavascriptRuleSetting = async ({
  primaryUrl,
  incognito,
}: {
  primaryUrl: string;
  incognito: boolean;
}) => {
  return new Promise<RuleSetting>((resolve, reject) => {
    chrome.contentSettings.javascript.get(
      {
        primaryUrl,
        incognito,
      },
      (details) => {
        cl(details, Log.RULES);
        resolve(details.setting);
      }
    );
  });
};

export const removePrimaryPatternFromRules = (primaryPattern: string) => {};

const reverseSetting = (setting: string) =>
  setting === "allow" ? "block" : "allow";

export const setJavascriptRule = async ({
  setting,
  primaryPattern,
  scope,
  tab,
}: {
  setting: QJS.ContentSettingRule["setting"];
  primaryPattern: QJS.ContentSettingRule["primaryPattern"];
  scope: QJS.ContentSettingRule["scope"];
  tab?: chrome.tabs.Tab;
}) => {
  const rule = {
    primaryPattern,
    setting,
    scope,
  };

  // console.log(isAllowedPattern(primaryPattern), "IS ALLOWED?");
  if (!isAllowedPattern(primaryPattern)) {
    console.error("not allowed pattern", primaryPattern);
    return;
  }

  // Remove the old rule, if any
  await removeJavascriptRule({
    primaryPattern,
    scope,
    setting: reverseSetting(setting),
  });
  // Check if default settings are what we want
  if (!tab || (await getTabSetting(tab)) !== setting) {
    await addJavascriptRule(rule);
  }
  if (tab) {
    await updateIcon(tab); //not needed because we update tab
    reloadTab(tab);
  }
};

export const addJavascriptRule = async (rule: QJS.ContentSettingRule) => {
  cl(rule, Log.RULES);
  console.log(chrome.contentSettings, "chrome.contentSettings");
  try {
    await chrome.contentSettings.javascript.set(rule);
    await setStorageRule(rule);
    console.info(
      `${rule.setting} ${rule.primaryPattern} rule added to content settings`
    );
  } catch (err) {
    console.error(err);
  }
};

export const rebaseJavascriptSettingsFromStorage = async () => {
  const storageRules = await getStorageRules();
  clearJavascriptRules();
  Object.entries(storageRules).forEach(([key, storageRule]) => {
    chrome.contentSettings.javascript.set(storageRule, async () => {});
  });
  console.info("Rebased settings from storage");
};

export const removeJavascriptRule = async (
  rule: Omit<QJS.ContentSettingRule, "setting">
) => {
  const storageRules = await getStorageRules();
  if (
    storageRules &&
    storageRules[rule.primaryPattern] &&
    storageRules[rule.primaryPattern].scope === rule.scope
  ) {
    delete storageRules[rule.primaryPattern];

    clearJavascriptRules();
    console.info(`${rule.primaryPattern} rule removed from content settings`);
    Object.entries(storageRules).forEach(([key, storageRule]) => {
      chrome.contentSettings.javascript.set(storageRule, async () => {});
    });
    await unsetStorageRule(rule);
  }
};

export const searchRulesForTab = async (tab: chrome.tabs.Tab) => {
  const { subdomain, domain } = getUrlAsObject(tab.url!);

  const rules = {
    subdomain: [
      `http://*.${domain}/*`,
      `http://${subdomain}${domain}/*`,
      `https://*.${domain}/*`,
      `https://${subdomain}${domain}/*`,
    ],
    domain: [`http://${domain}/*`, `https://${domain}/*`],
  };

  const subdomainPromises = rules.subdomain.map(async (url) => {
    const setting = await getJavascriptRuleSetting({
      primaryUrl: tab.url!,
      incognito: tab.incognito,
    });
    return [url, setting];
  });

  const domainPromises = rules.domain.map(async (url) => {
    const setting = await getJavascriptRuleSetting({
      primaryUrl: url,
      incognito: tab.incognito,
    });
    return [url, setting];
  });

  const subdomainRules = await Promise.all(subdomainPromises);
  const domainRules = await Promise.all(domainPromises);

  return {
    subdomain: subdomainRules,
    domain: domainRules,
  };
};

export const getSubdomainSetting = async (tab: chrome.tabs.Tab) => {
  const { subdomain } = await searchRulesForTab(tab);
  const hasSubdomainBlockedRules = subdomain.every(
    (rule) => rule[1] === "block"
  );

  return hasSubdomainBlockedRules ? "block" : "allow";
};
export const getDomainSetting = async (tab: chrome.tabs.Tab) => {
  const { domain } = await searchRulesForTab(tab);
  const hasDomainBlockedRules = domain.every((rule) => rule[1] === "block");

  return hasDomainBlockedRules ? "block" : "allow";
};
