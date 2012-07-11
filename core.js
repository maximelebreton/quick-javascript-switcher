/*
 * Quick Javascript Switcher Chrome Extension
 * http://github.com/maximelebreton/quick-javascript-switcher/
 *
 * GPL License. by Maxime Le Breton [www.maximelebreton.com]
 * Gear icon by Yusuke Kamiyamane
 */

var chromeContentSettings = chrome.contentSettings;
/* currently (chrome 16), infobars is not implemented (only experimental...) */
var chromeInfobars = chrome.infobars;

if(chromeContentSettings) {
	
	var extractHostname = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
		forbiddenOrigin = /(chrome\:\/\/)/g,
		incognito,
		url,
		setting,
		tabId,
		matchForbiddenOrigin;
	
	function updateIcon(setting) {
			chrome.browserAction.setIcon({path:"icon-" + setting + ".png"});
	}
	
	function getSettings() {
		chrome.tabs.getSelected(undefined, function(tab) {
			incognito = tab.incognito;
			url = tab.url+"*";
			tabId = tab.id;
			
			//console.info("Current tab settings : "+url);
			chromeContentSettings.javascript.get({
				'primaryUrl': url,
				'incognito': incognito
			},
			function(details) {
				//console.info("Current tab settings : "+url);
				matchForbiddenOrigin = url.match(forbiddenOrigin,'');
				matchForbiddenOrigin ? updateIcon("inactive") : updateIcon(details.setting);
				
			});
		});
	}
	
	function changeSettings() {
		if (!matchForbiddenOrigin) {
			chromeContentSettings.javascript.get({
				'primaryUrl': url,
				'incognito': incognito
			},
			function(details) {
				setting = details.setting;
				if (setting) {
					var pattern = /^file:/.test(url) ? url : url.match(extractHostname)[0]+'/*';
					// old method : url.replace(/\/[^\/]*?$/, '/*')
					var newSetting = (setting == 'allow' ? 'block' : 'allow'); 
					chromeContentSettings.javascript.set({
						'primaryPattern': pattern,
						'setting': newSetting,
						'scope': (incognito ? 'incognito_session_only' : 'regular')
					});
					updateIcon(newSetting);
					//console.info("javascript is now "+newSetting+"ed on "+pattern);
				}
				else {
					//console.error("error, the setting is "+setting);
				}
			});
		}
		else {
			
			if(chromeInfobars) {
				chromeInfobars.show({"tabId": tabId, "path": "infobar.html"});
			}
			else {
				//console.error("You can't disable javascript on "+url);
			}
			
		}
	}
	
	chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
		// Prevent multiple calls
		if (props.status == "loading" && tab.selected) {
			//console.info("onUpdated");
			getSettings();
		}
	});
	
	chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
		//console.info("onSelectionChanged");
		getSettings();
	});
	
	chrome.tabs.getSelected(null, function(tab) {
		//console.info("getSelected");
		getSettings();
	});
	
	chrome.browserAction.onClicked.addListener(changeSettings);
		
}
else {
	
	chrome.browserAction.onClicked.addListener(openJsPanel);
	
}

if (!localStorage.prefs) {
  localStorage.prefs = JSON.stringify({ "show_contextMenu": true });
}

var prefs = JSON.parse(localStorage.prefs);

if (prefs.show_contextMenu) {
	
	chrome.contextMenus.create({
		"title" : "Open Javascript panel",
		"type" : "normal",
		"contexts" : ["all"],
		"onclick" : openJsPanel()
	});
	
	function openJsPanel() {
		return function(info, tab) {
			chrome.tabs.create({"url":"chrome://settings/content#javascript", "selected":true});
		}
	}
	
}