root = chrome.extension.getBackgroundPage();
getById = function(id) {
  return document.getElementById(id)
}

document.addEventListener("webkitvisibilitychange", showRules, false);

function save() {

  root.cache.options.showContextMenu = getById("contextMenu").checked;
  root.cache.options.autoRefresh = getById("autoRefresh").checked;
  root.cache.options.useSync = getById("useSync").checked;

  root.chromeStorageMethod.set({
    "options": JSON.stringify(root.cache.options)
  }, function(data) {

    showRules();

  });

}

function showRules() {
  //chrome.extension.getBackgroundPage().getStorageRules();
  console.log(root.cache.rules);
  getById("qjs_rules").value = JSON.stringify(root.cache.rules);

}

window.onload = function() {


  showRules();


  getById("contextMenu").checked = root.cache.options.showContextMenu;
  getById("autoRefresh").checked = root.cache.options.autoRefresh;
  getById("useSync").checked = root.cache.options.useSync;

  getById("contextMenu").onclick = function() {
    save();
  };
  getById("autoRefresh").onclick = function() {
    save();
  };
  getById("useSync").onclick = function() {
    save();
  };

  getById("openJavascriptSettings").onclick = chrome.extension.getBackgroundPage().openJsPanel();

  getById("clearJavascriptSettings").onclick = function() {
    chrome.extension.getBackgroundPage().clearRules("contentSettings");
    chrome.extension.getBackgroundPage().openJsPanel().call();
  };

  getById("importRules").onclick = function() {
    if (getById("qjs_rules").value !== "") {
      chrome.extension.getBackgroundPage().importRules(JSON.parse(getById("qjs_rules").value));
      chrome.extension.getBackgroundPage().openJsPanel().call();
    }
  };

  getById("clearLocalStorageRules").onclick = function() {
    chrome.extension.getBackgroundPage().clearRules("localStorage");
    showRules();
  };

}
