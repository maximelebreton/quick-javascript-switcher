import { createApp } from "vue";
import App from "../view/popup.vue";

chrome.runtime.sendMessage({ popupOpen: true });
chrome.runtime.connect({ name: "popup" });

createApp(App).mount("#app");
