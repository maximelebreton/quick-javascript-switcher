/*
 * Quick Javascript Switcher Chrome Extension
 * http://github.com/maximelebreton/quick-javascript-switcher/
 *
 * GPL License. by Maxime Le Breton [www.maximelebreton.com]
 * Gear icon by Yusuke Kamiyamane
 */

var prefs;
var contextMenuId = null;

var chromeContentSettings = chrome.contentSettings;
/* currently, infobars is not implemented (only experimental...) */
var chromeInfobars = chrome.infobars;


init();

if(chromeContentSettings) {
	
	var extractHostname = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
		forbiddenOrigin = /(chrome\:\/\/)/g,
		incognito,
		url,
		setting,
		tabId,
		matchForbiddenOrigin;

	chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
		// Prevent multiple calls
		if (props.status == "loading" && tab.selected) {
			//console.info("onUpdated");
			getSettings();
		}
	});

	chrome.tabs.onHighlighted.addListener(function() {
		//console.info("onHighlighted");
		getSettings();
	});

	chrome.windows.onFocusChanged.addListener(function() {
		//console.info("onFocusChanged");
		getSettings();
	});

	chrome.windows.getCurrent(function(win) {
		chrome.tabs.query( {'windowId': win.id, 'active': true}, function(){
			//console.info("getCurrent");
			getSettings();
		});
	});

	chrome.browserAction.onClicked.addListener(changeSettings);

	
	chrome.commands.onCommand.addListener(function(command) {
	  if (command == "toggle-qjs") {
	    changeSettings();
	  }
	});


} else {
	chrome.browserAction.onClicked.addListener(openJsPanel.call());
}

function updateIcon(setting) {
		chrome.browserAction.setIcon({path:"icon-" + setting + ".png"});
}

function getSettings() {
	chrome.tabs.getSelected(undefined, function(tab) {
		incognito = tab.incognito;
		url = tab.url;
		tabId = tab.id;
		
		//console.info("Current tab settings : "+url);
		chromeContentSettings.javascript.get({
			'primaryUrl': url,
			'incognito': incognito
		},
		function(details) {
			//console.info("Current tab settings : "+url);
			url ? matchForbiddenOrigin = url.match(forbiddenOrigin,'') : matchForbiddenOrigin = true;
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
				}, function() {

					updateIcon(newSetting);

					if (prefs.autoRefresh) {
						chrome.tabs.reload(tabId);
					}

					setLocalStorageRule(pattern, newSetting);

				});				

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


function getLocalStorageRules() {
	return window.localStorage.qjs_rules;
}

function setLocalStorageRule(pattern, newSetting) {

	if (!incognito) {

		var keyExist = false;

		if (rules.length) {
			for(i = 0; i < rules.length; i++) {
				if(pattern == rules[i].primaryPattern) {
					rules[i].setting = newSetting;
					keyExist = true;
					break;
				}
			}
		}

		if (!keyExist) {

			// to do : keep only block, only allow or both

			rules.push({
				'primaryPattern': pattern,
				'setting': newSetting,
				'scope': (incognito ? 'incognito_session_only' : 'regular')
			});
		}

		window.localStorage.setItem('qjs_rules',JSON.stringify(rules));

	}

}

function importRules(localStorageRules) {

	var rules = localStorageRules;

	// todo : delete spaces

	if (rules.length) {
		for(i = 0; i < rules.length; i++) {

			chrome.contentSettings.javascript.set({
				'primaryPattern': rules[i].primaryPattern,
				'setting': rules[i].setting,
				'scope': rules[i].scope
			});
		}
	}

	window.localStorage.setItem('qjs_rules',JSON.stringify(rules));

}

function clearRules(arg) {
	
	if (arg == "contentSettings" || arg === undefined) {
		chromeContentSettings.javascript.clear({'scope': (incognito ? 'incognito_session_only' : 'regular')});
	}
	if (arg == "localStorage" || arg === undefined) {
		rules = [];
		window.localStorage.setItem('qjs_rules',[]);
	}
}

function getLocalStoragePrefs() {
	
	// qjs_prefs
	if (!window.localStorage.qjs_prefs) {
		window.localStorage.qjs_prefs = JSON.stringify({ "showContextMenu": true, "autoRefresh": true });
	}
	prefs = JSON.parse(window.localStorage.qjs_prefs);

	// qjs_rules
	if (!window.localStorage.qjs_rules) {
		clearRules("localStorage");
	} else {
		rules = JSON.parse(window.localStorage.qjs_rules);
	}

	// qjs_version
	var currentVersion = getVersion();
	var previousVersion = window.localStorage.qjs_version;
	if (currentVersion != previousVersion) {
		if (typeof previousVersion == 'undefined') {
			onInstall();
		} else {
			onUpdate();
		}
		window.localStorage.qjs_version = currentVersion;
	}

}

// Check if the version has changed.
function onInstall() {
	if (rules.length) {	importRules(rules);	}
}
function onUpdate() {
	if (rules.length) {	importRules(rules);	}
}
function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}

function toggleContextMenu() {

	if (prefs.showContextMenu && !contextMenuId) {
		
		contextMenuId = chrome.contextMenus.create({
			"title" : "Go to JavaScript settings",
			"type" : "normal",
			"contexts" : ["all"],
			"onclick" : openJsPanel()
		});
		
	}

	if (!prefs.showContextMenu && contextMenuId) {
		
		chrome.contextMenus.remove(contextMenuId);
		contextMenuId = null;
		
	}

}

function openJsPanel() {
	return function(info, tab) {
		chrome.tabs.create({"url":"chrome://chrome/settings/contentExceptions#javascript", "selected":true});
	};
}

function init() {
	
	getLocalStoragePrefs();
	toggleContextMenu();
	
}