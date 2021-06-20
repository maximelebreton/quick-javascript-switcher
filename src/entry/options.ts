import { createApp } from "vue";
import App from "../view/options.vue";

import * as computed from "./options/computed";
import * as methods from "./options/methods";

const useMethods = () => ({
  ...methods,
});
const useComputed = () => ({
  ...computed,
});
export { useComputed, useMethods };
export * from "./options/watchers";
export * from "./options/state";

createApp(App).mount("#app");
