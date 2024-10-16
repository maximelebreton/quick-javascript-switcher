import { initContextMenus } from "./background/contextmenus";
import { initEvents } from "./background/events";
import { initTabs } from "./background/tabs";
import { initWatchers } from "./background/watchers";

const init = async () => {
  initWatchers();
  initContextMenus();
  initEvents();
  initTabs();
};

init();
