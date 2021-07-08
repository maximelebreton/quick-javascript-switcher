import { merge } from "lodash";
import { RuleSetting } from "./contentsettings";
import { getState, State } from "./state";
import { cl, Log } from "./utils";

export namespace QJS {
  export type ContentSettingRule = {
    [key: string]: string;
    primaryPattern: string;
    setting: RuleSetting;
    scope: "incognito_session_only" | "regular";
  };
  export type ContentSettingRules = { [key: string]: ContentSettingRule };
  export type Storage = {
    rules: string;
    state: string;
  };
}

export const getStorageMethod = async () => {
  return new Promise<typeof chrome.storage.sync | typeof chrome.storage.local>(
    (resolve, reject) => {
      chrome.storage.local.get(["state"], (value) => {
        const state: State = value["state"] ? JSON.parse(value["state"]) : {};

        if (state && state.options && state.options.useSync === true) {
          resolve(chrome.storage.sync);
        } else {
          resolve(chrome.storage.local);
        }
      });
    }
  );

  // if (state.options.useSync === true) {
  //   return chrome.storage.sync;
  // } else {
  //   return chrome.storage.local;
  // }
};

export const getStorage = async (name: keyof QJS.Storage) => {
  const storageMethod = await getStorageMethod();
  return new Promise<any>((resolve, reject) => {
    storageMethod.get([name], (value: any) => {
      let result;
      // console.log("VALUE", value);
      cl(value, Log.STORAGE);

      result = value[name] ? JSON.parse(value[name]) : {};

      cl(result, Log.STORAGE);
      resolve(result);
    });
  });
};

export const getStorageRules = async () => {
  return new Promise<{
    [key: string]: QJS.ContentSettingRule;
  }>(async (resolve, reject) => {
    const rules = (await getStorage("rules")) as QJS.ContentSettingRules;
    cl(rules, Log.RULES, "rules");
    resolve(rules);
  });
};

export const clearStorageRules = async () => {
  const storageMethod = await getStorageMethod();
  storageMethod.clear(() => {
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
  const storageMethod = await getStorageMethod();
  return new Promise<void>((resolve, reject) => {
    storageMethod.set({ [name]: JSON.stringify(value) }, () => {
      resolve();
    });
  });
};

export const getAllStorage = async () => {
  const storageMethod = await getStorageMethod();
  return new Promise((resolve, reject) => {
    //@ts-ignore
    storageMethod.get(null, (items: QJS.Storage) => {
      resolve(items);
    });
  });
};
