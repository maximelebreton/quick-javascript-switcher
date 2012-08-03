// Make sure the checkbox checked state gets properly initialized from the
// saved preference.
window.onload = function() {
	var prefs = JSON.parse(localStorage.prefs_QJS);
	document.getElementById("contextMenu").checked = prefs.showContextMenu;
	document.getElementById("autoRefresh").checked = prefs.autoRefresh;
		
	function save() {
		var prefs = JSON.parse(localStorage.prefs_QJS);
		prefs.showContextMenu = document.getElementById("contextMenu").checked;
		prefs.autoRefresh = document.getElementById("autoRefresh").checked;
		localStorage.prefs_QJS = JSON.stringify(prefs);	
		
		chrome.extension.getBackgroundPage().init();
	}
	
	document.getElementById("contextMenu").onclick = function() { save(); };
	document.getElementById("autoRefresh").onclick = function() { save(); };

}

