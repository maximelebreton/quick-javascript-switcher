import { rebaseJavascriptSettingsFromStorage } from "./background/contentsettings";
import { initContextMenus } from "./background/contextmenus";
import { initEvents } from "./background/events";
import { initTabs } from "./background/tabs";

console.log("hello doom world background todo something~");

const init = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    console.log(changes, "changes");
    console.log(areaName, "areaname");
    const { newValue, oldValue } = changes;
    if (newValue !== oldValue) {
      await rebaseJavascriptSettingsFromStorage();
    }
  });

  //@ts-ignore
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.popupOpen === true) {
      console.log("it's working !");
    }
    if (message.popupOpen === false) {
      console.log("Popup closed");
    }
  });

  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popup") {
      port.onDisconnect.addListener(function () {
        console.log("popup has been closed");
      });
    }
  });

  initContextMenus();
  initEvents();
  initTabs();
};

init();
