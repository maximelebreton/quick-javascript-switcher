import { watch, toRefs } from "vue";
import { getInputRule, modelInputHost, userRules } from "./computed";
import { checkExistingRules } from "./methods";
import { getUseSyncState, state } from "./state";
import { syncOptionsToStorage } from "./state";
import { cloneDeep } from "lodash";

// export const bindOnInputRuleChange = watch(
//   () => getInputRule.value,
//   (rule, oldRule) => {
//     console.log("hey");
//     checkExistingRules(rule);
//   }
// );

// export const bindOnRulesChange = watch(
//   () => userRules.value,
//   (rules, oldRules) => {
//     checkExistingRules(getInputRule.value);
//   }
// );
// export const bindOnHostChange = watch(
//   () => modelInputHost.value,
//   (rules, oldRules) => {
//     console.log("'heyehyehryzer host");
//   }
// );

// export const bindOptionsWatcher = watch(
//   () => getUseSyncState.value,
//   (newOptions, oldOptions) => {
//     console.log("new options watched, start SYNC!");
//     // await syncOptionsToStorage(newOptions);
//   }
// );

// export const initWatchers = () => {
//   bindOnInputRuleChange();
//   bindOnRulesChange();
//   bindOptionsWatcher();
//   bindOnHostChange();
// };
