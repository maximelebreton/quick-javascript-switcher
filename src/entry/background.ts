import { initContextMenus } from "./background/contextmenus";
import { initEvents } from "./background/events";
import { initState } from "./background/state";
import { initTabs } from "./background/tabs";

console.log("hello doom world background todo something~");

const init = async () => {
  initState();
  initContextMenus();
  initEvents();
  initTabs();
};

init();
