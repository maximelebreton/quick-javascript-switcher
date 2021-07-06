import { createApp } from "vue";
import App from "../view/popup.vue";

chrome.runtime.sendMessage({ popupOpen: true });
// chrome.runtime.connect({ name: "popup" });
chrome.runtime.connect("popup");

createApp(App).mount("#app");
