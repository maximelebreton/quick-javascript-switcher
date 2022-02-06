import { merge } from "lodash";
import { RuleSetting } from "./contentsettings";
import { getState, State } from "./state";
import { cl, Log } from "./utils";
import { Options } from "./_types";

// eslint-disable-next-line @typescript-eslint/no-namespace
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
    options: string;
  };
}

export const getUseSyncFromStorage = () => {
  return new Promise<Options["useSync"]>(async (resolve, reject) => {
    chrome.storage.local.get(["useSync"], (value: any) => {
      let result;

      result = value["useSync"] ? JSON.parse(value["useSync"]) : true;

      console.log("VALUE", result);
      resolve(result);
    });
  });
};

export const setUseSyncToStorage = (value: boolean) => {
  chrome.storage.local.set({ ["useSync"]: JSON.stringify(value) }, () => {
    console.log("useSync set to: " + value);
  });
};

export const getStorageMethod = async () => {
  return new Promise<typeof chrome.storage.sync | typeof chrome.storage.local>(
    async (resolve, reject) => {
      // chrome.storage.local.get(["options"], (value) => {
      //   console.log(value);
      //   const options: Options = value["options"]
      //     ? JSON.parse(value["options"])
      //     : {};

      //   if (options && options.useSync === true) {
      //     console.info("Chrome storage method: Sync");
      //     resolve(chrome.storage.sync);
      //   } else {
      //     console.info("Chrome storage method: Local");
      //     resolve(chrome.storage.local);
      //   }
      // });
      const useSync = await getUseSyncFromStorage();
      if (useSync === true) {
        console.info("Chrome storage method: Sync");
        resolve(chrome.storage.sync);
      } else {
        console.info("Chrome storage method: Local");
        resolve(chrome.storage.local);
      }
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
  return new Promise<QJS.ContentSettingRules>(async (resolve, reject) => {
    const rules = (await getStorage("rules")) as QJS.ContentSettingRules;
    cl(rules, Log.RULES, "rules");
    resolve(rules);
  });
};

export const getStorageOptions = async () => {
  return new Promise<Options>(async (resolve, reject) => {
    const options = ((await getStorage("options")) as Options) || {};
    resolve(options);
  });
};

export const clearStorageRules = async () => {
  const storageMethod = await getStorageMethod();
  storageMethod.clear(() => {
    console.info("Stored rules clear");
  });
};

export const unsetStorageRule = async (
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
export const setStorageRule = async (rule: QJS.ContentSettingRule) => {
  if (rule.scope === "regular") {
    const existingRules = await getStorageRules();
    existingRules[rule.primaryPattern] = rule;
    await setStorage("rules", existingRules);
    console.info(
      `${rule.setting} ${rule.primaryPattern} rule added to storage`
    );
  }
};

export const setStorageOptions = async (
  key: keyof Options,
  value: Options[keyof Options]
) => {
  const existingOptions = await getStorageOptions();
  existingOptions[key] = value;
  await setStorage("options", existingOptions);
  console.info(`${key} option is now set to ${value} in storage`);
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

export const convertOldRulesToNew = (rules: Array<QJS.ContentSettingRule>) => {
  const convertedRules: QJS.ContentSettingRules = {};
  if (Array.isArray(rules)) {
    rules.forEach((rule: QJS.ContentSettingRule) => {
      convertedRules[rule.primaryPattern] = rule;
    });
    return convertedRules;
  }
};
