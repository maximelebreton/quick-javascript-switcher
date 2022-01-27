import { initContextMenus } from "./background/contextmenus";
import { initEvents } from "./background/events";
import { initTabs } from "./background/tabs";
import { initWatchers } from "./background/watchers";

console.log("hello doom world background todo something~");

const init = async () => {
  initWatchers();
  initContextMenus();
  initEvents();
  initTabs();
};

init();
