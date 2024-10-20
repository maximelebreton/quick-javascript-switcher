import { isValidPrimaryPattern } from "../options/computed";
import { clearJavascriptRules, handleClear, reloadTab } from "./actions";
import { cl, isAllowedPattern, Log } from "./utils";
import { updateIcon } from "./icon";
import {
  getDomainStorageRulesFromUrl,
  getStorageRules,
  QJS,
  setStorageRule,
  unsetStorageRule,
} from "./storage";
import { getUrlAsObject, isValidScheme } from "./utils";

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
        cl('Current content setting:' + JSON.stringify(details), Log.RULES, 'CONTENT SETTINGS RULE: '+primaryUrl);
        resolve(details.setting);
      }
    );
  });
};

export const removeConflictedRulesFromPattern = async (tabPattern: string) => {
  const { scheme: tabScheme, subdomain: tabSubdomain, domain: tabDomain } = getUrlAsObject(tabPattern);

  const existingDomainRules = await getDomainStorageRulesFromUrl(tabPattern)
  
  Object.entries(existingDomainRules).forEach(async ([storagePattern, rule]) => {
    const { scheme: storageScheme, subdomain: storageSubdomain, domain: storageDomain } = getUrlAsObject(storagePattern);
    cl({urlScheme: tabScheme, patternScheme: storageScheme, urlSubdomain: tabSubdomain, patternSubdomain: storageSubdomain, urlDomain: tabDomain, patternDomain: storageDomain}, Log.RULES, "Potential conflicted rules with: "+tabPattern)
    if (tabScheme !== storageScheme && tabSubdomain === storageSubdomain && tabDomain === storageDomain) {
      await removeJavascriptRule(rule)
      cl(`Conflicted rule removed: ${storagePattern} (conflict with url: ${tabPattern})`, Log.RULES)
    } 
    if ((tabSubdomain === '*.' && storageSubdomain === '') && tabDomain === storageDomain) {
      console.warn(`Potential conflicted rule: ${storagePattern} (conflict with url: ${tabPattern})`)
    }
  })

  //subdomain: `${scheme}${schemeSuffix}${subdomain}${domain}/*`,
}


export const removePrimaryPatternFromRules = (primaryPattern: string) => {};

export const setJavascriptRule = ({
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
  return new Promise<void>(async (resolve, reject) => {
    const rule = {
      primaryPattern,
      setting,
      scope,
    };

    // console.log(isAllowedPattern(primaryPattern), "IS ALLOWED?");
    if (!isAllowedPattern(primaryPattern)) {
      return;
    }

    // if (setting === "allow") {
    //   await removeJavascriptRule(rule);
    // } else {
    //   await addJavascriptRule(rule);
    // }
    await removeConflictedRulesFromPattern(rule.primaryPattern)

    await addJavascriptRule(rule);
    if (tab) {
      await updateIcon(tab); //not needed because we update tab
      reloadTab(tab);
    }
    resolve();
  });
};

export const clearJavascriptRule = ({
  primaryPattern,
  scope,
  tab,
}: {
  primaryPattern: QJS.ContentSettingRule["primaryPattern"];
  scope: QJS.ContentSettingRule["scope"];
  tab?: chrome.tabs.Tab;
}) => {

  return new Promise<void>(async (resolve, reject) => {
    const rule = {
      primaryPattern,
      scope,
    };

    if (!isAllowedPattern(primaryPattern)) {
      return;
    }

   // await removeConflictedRulesFromPattern(rule.primaryPattern)

    await removeJavascriptRule(rule);
    if (tab) {
      await updateIcon(tab); //not needed because we update tab
      reloadTab(tab);
    }
    resolve();
  });
}

export const addJavascriptRule = async (rule: QJS.ContentSettingRule) => {
  cl(rule, Log.RULES);
  return new Promise<void>(async (resolve, reject) => {
    console.log(chrome.contentSettings, "chrome.contentSettings");

    chrome.contentSettings.javascript.set(rule, async () => {
      console.info(
        `${rule.setting} ${rule.primaryPattern} rule added to content settings`
      );

      //@ts-expect-error
      if (chrome.runtime.lastError) {
        //@ts-expect-error
        console.error(chrome.runtime.lastError.message);
      } else {
        await setStorageRule(rule);
      }
      resolve();
    });
  });
};

export const rebaseJavascriptSettingsFromStorage = async () => {
  return new Promise<void>(async (resolve, reject) => {
    const storageRules = await getStorageRules();
    clearJavascriptRules();
    Object.entries(storageRules).forEach(([key, storageRule]) => {
      chrome.contentSettings.javascript.set(storageRule, async () => {});
    });
    console.info("Rebased settings from storage");
    resolve();
  });
};

export const removeJavascriptRule = async (
  rule: Pick<QJS.ContentSettingRule, "primaryPattern" | "scope">
) => {
  return new Promise<void>(async (resolve, reject) => {

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
    resolve();
  });
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
