root = chrome.extension.getBackgroundPage();
getById = function(id) {
  return document.getElementById(id)
}

document.addEventListener("webkitvisibilitychange", showRules, false);

function save() {

  root.prefs.showContextMenu = getById("contextMenu").checked;
  root.prefs.autoRefresh = getById("autoRefresh").checked;
  root.prefs.useSync = getById("useSync").checked;

  root.chromeStorageMethod.set({
    "qjs_options": JSON.stringify(root.prefs.qjs_options)
  }, function(data) {

    showRules();

  });

}

function showRules() {
  //chrome.extension.getBackgroundPage().getStorageRules();

  getById("qjs_rules").value = root.prefs.qjs_rules;

}

window.onload = function() {


  showRules();


  getById("contextMenu").checked = root.prefs.qjs_options.showContextMenu;
  getById("autoRefresh").checked = root.prefs.qjs_options.autoRefresh;
  getById("useSync").checked = root.prefs.qjs_options.useSync;

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
