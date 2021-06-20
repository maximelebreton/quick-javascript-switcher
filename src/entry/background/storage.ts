import state from "./state";
import { merge } from "lodash";
import { RuleSetting } from "./contentsettings";

export namespace QJS {
  export type ContentSettingRule = {
    [key: string]: string;
    primaryPattern: string;
    setting: RuleSetting;
    scope: "incognito_session_only" | "regular";
  };
  export type Storage = {
    rules: string;
  };
}

export const getStorageMethod = () => {
  if (state.options.useSync === true) {
    return chrome.storage.sync;
  } else {
    return chrome.storage.local;
  }
};

export const getStorage = async (name: string) => {
  return new Promise<QJS.Storage>((resolve, reject) => {
    getStorageMethod().get([name], (value) => {
      let result;
      if (typeof value === "string") {
        result = JSON.parse(value);
      } else {
        result = value;
      }
      resolve(result);
    });
  });
};

export const getStorageRules = async () => {
  return new Promise<{
    [key: string]: QJS.ContentSettingRule;
  }>(async (resolve, reject) => {
    const storage = await getStorage("rules");
    const rules = storage.rules ? JSON.parse(storage.rules) : {};
    resolve(rules);
  });
};

export const clearStorageRules = () => {
  getStorageMethod().clear(() => {
    console.info("Stored rules clear");
  });
};

export const unsetStorageRules = async (
  rule: Omit<QJS.ContentSettingRule, "setting">
) => {
  return new Promise<void>(async (resolve, reject) => {
    if (rule.scope === "regular") {
      const existingRules = await getStorageRules();
      delete existingRules[rule.primaryPattern];
      await setStorage("rules", existingRules);
      console.info(`${rule.primaryPattern} removed from storage`);
    }
    resolve();
  });
};
export const setStorageRules = async (rule: QJS.ContentSettingRule) => {
  if (rule.scope === "regular") {
    const existingRules = await getStorageRules();
    existingRules[rule.primaryPattern] = rule;
    await setStorage("rules", existingRules);
    console.info(
      `${rule.setting} ${rule.primaryPattern} rule added to storage`
    );
  }
};

export const setStorage = async (name: string, value: any) => {
  return new Promise<void>(async (resolve, reject) => {
    getStorageMethod().set({ [name]: JSON.stringify(value) }, () => {
      resolve();
    });
  });
};
