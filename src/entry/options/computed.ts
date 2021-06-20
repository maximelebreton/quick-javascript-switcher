import { state } from "./state";
import { computed } from "vue";
import { getColorClass } from "./methods";
import { get, set } from "lodash";
import { getStorageRules, QJS } from "../background/storage";
import { isAllowedPattern } from "../background/utils";

export const isHelpDisplayed = computed(() => state.isHelpDisplayed);
export const helpMessage = computed(() => state.helpMessage);

export const getRules = computed(() => Object.values(state.rules!));

export const filteredRules = computed(() => {
  let filteredRules = [] as { index: number; rule: QJS.ContentSettingRule }[];

  getRules.value.forEach((rule, index) => {
    let condition = Object.keys(rule).some(function (key) {
      return rule[key].includes(state.filterQuery);
    });

    if (condition) {
      filteredRules.push({ index: Number(index), rule: rule });
    }
  });

  return filteredRules;
});

export const schemeSuffix = computed(() => {
  return state.input.scheme === "file" ? ":///" : "://";
});

export const actionText = computed(() => {
  return (state.isEditMode ? "update" : "add") + " rule";
});

export const colorClass = computed(() => {
  return getColorClass(state.input.setting);
});

export const getPrimaryPattern = computed(() => {
  let scheme =
    (state.input.scheme ? `${state.input.scheme}` : "*") + schemeSuffix.value;
  //let subdomain = state.input.subdomain ? `${state.input.subdomain}` : "*";
  let host = state.input.host ? `${state.input.host}` : "";
  let path = "/" + (state.input.path ? `${state.input.path}` : "*");

  return `${scheme}${host}${path}`;
});

export const isValidHostname = (hostname: string) => {
  const regex =
    "^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*$";
  const re = new RegExp(regex);
  return re.test(hostname);
};

export const isValidPrimaryPattern = computed(() => {
  return isAllowedPattern(getPrimaryPattern.value);
  // return state.input.host === "" || state.input.setting === "" ? false : true;
});

export const getInputRule = computed(() => {
  return {
    primaryPattern: getPrimaryPattern.value,
    setting: state.input.setting,
    scope: "regular",
  } as QJS.ContentSettingRule;
});

export const userRules = computed(() => getRules.value);

export const toVModel = (name: string) => {
  return computed({
    get() {
      return get(state, name);
    },
    set(value) {
      set(state, name, value);
    },
  });
};

export const modelFilterQuery = toVModel("filterQuery");

export const modelInputSetting = toVModel("input.setting");

export const modelInputScheme = toVModel("input.scheme");

export const modelInputHost = toVModel("input.host");

export const modelInputPath = toVModel("input.path");

export const exportedRules = computed(() => {
  return JSON.stringify(state.rules, null, 2);
});

export const getEditedRuleIndex = computed(() => state.ruleIndex);
