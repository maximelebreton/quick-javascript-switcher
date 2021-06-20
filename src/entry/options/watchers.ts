import { watch } from "vue";

import { getInputRule, userRules } from "./computed";
import { checkExistingRules } from "./methods";

export const bindOnInputRuleChange = watch(
  () => getInputRule.value,
  (rule, oldRule) => {
    checkExistingRules(rule);
  }
);

export const bindOnRulesChange = watch(
  () => userRules.value,
  (rules, oldRules) => {
    checkExistingRules(getInputRule.value);
  }
);

export const initWatchers = () => {
  bindOnInputRuleChange();
  bindOnRulesChange();
};
