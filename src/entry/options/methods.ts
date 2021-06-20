import { state } from "./state";
import { isEqual } from "lodash";
import { getEditedRuleIndex, getInputRule, getRules } from "./computed";
import { getStorageRules, QJS } from "../background/storage";
import {
  addJavascriptRule,
  removeJavascriptRule,
} from "../background/contentsettings";

export const fetchRules = async () => {
  const rules = await getStorageRules();
  return new Promise<void>((resolve, reject) => {
    console.log(rules, "FETCHED RULES");
    state.rules = rules;
    resolve();
  });
};

export const showHelp = (name: string) => {
  console.log("HE");
  state.isHelpDisplayed = true;
  state.helpMessage = state.helpMessages[name];
};

export const hideHelp = () => {
  state.isHelpDisplayed = false;
};

export const cleanInput = () => {
  state.input.scheme = state.schemeOptions[0].value;
  state.input.subdomain = "";
  state.input.host = "";
  state.input.path = "";
  state.input.setting = state.settingOptions[0].value;
};

export const checkExistingRules = (rule: QJS.ContentSettingRule) => {
  state.isAnExistingRule = false;

  getRules.value.forEach(function (existingRule) {
    if (isEqual(rule, existingRule)) {
      state.isAnExistingRule = true;
    }
  });
};

export const getColorClass = (setting: string) => {
  return setting === "allow" ? "success" : "danger";
};

export const actionRule = async () => {
  const rule = getInputRule.value;
  if (state.isEditMode && getEditedRuleIndex.value) {
    await updateRule(rule, getEditedRuleIndex.value);
  } else {
    if (!state.isAnExistingRule) {
      await addRule(rule);
    }
  }
};

function resolveAfter2Seconds() {
  console.log("2 sec!");
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("ok go.");
      resolve();
    }, 2000);
  });
}

export const addRule = async (rule: QJS.ContentSettingRule) => {
  // state.rules.push(getInputRule.value);
  await addJavascriptRule(rule);
  // await resolveAfter2Seconds();
  await fetchRules();
  resetEditState();
  cleanInput();
};

export const editRule = (index: number) => {
  const rule = getRules.value[index];

  const regex = /(.+):\/+([^/]+)\/(.*)/gm;

  //@ts-ignore
  const [primaryPattern, scheme, host, path] = regex.exec(rule.primaryPattern);

  state.input.scheme = scheme;
  state.input.host = host;
  state.input.path = path;
  state.input.setting = rule.setting;

  state.isEditMode = true;
  state.ruleIndex = Number(index);
};

export const cancelEditRule = () => {
  cleanInput();
  resetEditState();
};

export const updateRule = async (
  rule: QJS.ContentSettingRule,
  index: number
) => {
  // state.rules.splice(getEditedRuleIndex.value, 1);

  const editedRule = getRuleByIndex(index);
  console.log(editedRule, " EDITED RUE");
  await removeJavascriptRule(editedRule);
  console.info(editedRule, "RULE REMOVED");

  await addRule(rule);
  console.info(rule, "RULE ADDED");

  await fetchRules();

  resetEditState();
};

export const getRuleByIndex = (index: number) => {
  const rule = getRules.value[index];
  return rule;
};

export const removeRule = async (index: number) => {
  // state.rules.splice(index, 1);
  const rule = getRuleByIndex(index);
  await removeJavascriptRule(rule);
  await fetchRules();
  if (state.isEditMode && getEditedRuleIndex.value === index) {
    resetEditState();
    cleanInput();
  }
};

export const resetEditState = () => {
  state.isEditMode = false;
  state.ruleIndex = null;
};
