

document.addEventListener("webkitvisibilitychange", showRules, false);

function save() {
	var prefs = JSON.parse(window.localStorage.qjs_prefs);
	prefs.showContextMenu = document.getElementById("contextMenu").checked;
	prefs.autoRefresh = document.getElementById("autoRefresh").checked;
	window.localStorage.qjs_prefs = JSON.stringify(prefs);
	
	chrome.extension.getBackgroundPage().init();
}
function showRules() {
	document.getElementById("qjs_rules").value = chrome.extension.getBackgroundPage().getLocalStorageRules();
}

window.onload = function() {

	var prefs = JSON.parse(window.localStorage.qjs_prefs);

	showRules();

	document.getElementById("contextMenu").checked = prefs.showContextMenu;
	document.getElementById("autoRefresh").checked = prefs.autoRefresh;
	
	document.getElementById("contextMenu").onclick = function() { save(); };
	document.getElementById("autoRefresh").onclick = function() { save(); };
	
	document.getElementById("openJavascriptSettings").onclick = chrome.extension.getBackgroundPage().openJsPanel();

	document.getElementById("clearJavascriptSettings").onclick = function() {
		chrome.extension.getBackgroundPage().clearRules("contentSettings");
		chrome.extension.getBackgroundPage().openJsPanel().call();
	};

	document.getElementById("importRules").onclick = function() {
		if (document.getElementById("qjs_rules").value !== "") {
			chrome.extension.getBackgroundPage().importRules(JSON.parse(document.getElementById("qjs_rules").value));
			chrome.extension.getBackgroundPage().openJsPanel().call();
		}
	};

	document.getElementById("clearLocalStorageRules").onclick = function() {
		chrome.extension.getBackgroundPage().clearRules("localStorage");
		showRules();
	};

}

