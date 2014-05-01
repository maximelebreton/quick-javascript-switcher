/*
 * Quick Javascript Switcher Chrome Extension
 * http://github.com/maximelebreton/quick-javascript-switcher/
 *
 * GPL License. by Maxime Le Breton [www.maximelebreton.com]
 * Gear icon by Yusuke Kamiyamane
 */

var prefs = {};
var contextMenuId = null;

var chromeContentSettings = chrome.contentSettings;
/* currently, infobars is not implemented (only experimental...) */
var chromeInfobars = chrome.infobars;

var chromeStorageMethod;

var default_qjs_options = {
  "showContextMenu": true,
  "autoRefresh": true,
  "useSync": true
};


init();

if (chromeContentSettings) {

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
    chrome.tabs.query({
      'windowId': win.id,
      'active': true
    }, function() {
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

  chrome.storage.onChanged.addListener(function(callback) {

    for (var index in callback) {
      if (callback.hasOwnProperty(index)) {
        console.log(callback[index]);
        prefs[index] = JSON.stringify(callback[index].newValue);
        console.log(prefs);
      }
    }

    refresh();

  });


} else {
  chrome.browserAction.onClicked.addListener(openJsPanel.call());
}

function updateIcon(setting) {
  chrome.browserAction.setIcon({
    path: "icons/icon-" + setting + ".png"
  });
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
        url ? matchForbiddenOrigin = url.match(forbiddenOrigin, '') : matchForbiddenOrigin = true;
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

          chrome.browserAction.setBadgeText({
            text: "ON"
          });
          chrome.browserAction.setTitle({
            title: "euh"
          });

          var pattern = /^file:/.test(url) ? url : url.match(extractHostname)[0] + '/*';

          // old method : url.replace(/\/[^\/]*?$/, '/*')
          var newSetting = (setting == 'allow' ? 'block' : 'allow');
          chromeContentSettings.javascript.set({
            'primaryPattern': pattern,
            'setting': newSetting,
            'scope': (incognito ? 'incognito_session_only' : 'regular')
          }, function() {

            updateIcon(newSetting);

            if (prefs.qjs_options.autoRefresh) {
              chrome.tabs.reload(tabId);
            }

            setStorageRule(pattern, newSetting);

          });

          //console.info("javascript is now "+newSetting+"ed on "+pattern);
        } else {
          //console.error("error, the setting is "+setting);
        }
      });
  } else {

    if (chromeInfobars) {
      chromeInfobars.show({
        "tabId": tabId,
        "path": "infobar.html"
      });
    } else {
      //console.error("You can't disable javascript on "+url);
    }

  }

}


function setStorageRule(pattern, newSetting) {

  if (!incognito) {

    var keyExist = false;

    if (rules.length) {
      for (i = 0; i < rules.length; i++) {
        if (pattern == rules[i].primaryPattern) {
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

    //window.localStorage.setItem('qjs_rules',JSON.stringify(rules));
    chromeStorageMethod.set({
      "qjs_rules": JSON.stringify(rules)
    }, function() {
      console.log("saved ok");
    });

  }

}

function importRules(storageRules) {

  var rules = storageRules;

  // todo : delete spaces

  if (rules.length) {
    for (i = 0; i < rules.length; i++) {

      chrome.contentSettings.javascript.set({
        'primaryPattern': rules[i].primaryPattern,
        'setting': rules[i].setting,
        'scope': rules[i].scope
      });
    }
  }

  //window.localStorage.setItem('qjs_rules',JSON.stringify(rules));
  chromeStorageMethod.set({
    "qjs_rules": JSON.stringify(rules)
  }, function() {
    console.log("saved ok");
  });

}

function clearRules(arg) {

  if (arg == "contentSettings" || arg === undefined) {
    chromeContentSettings.javascript.clear({
      'scope': (incognito ? 'incognito_session_only' : 'regular')
    });
  }
  if (arg == "localStorage" || arg === undefined) {
    rules = [];
    //window.localStorage.setItem('qjs_rules',[]);
    chromeStorageMethod.set({
      "qjs_rules": []
    }, function() {
      console.log("clear ok");
    });
  }
}


function getStoragePrefs(callback) {


	if (typeof prefs.qjs_options != "undefined") {

	  if (!prefs.qjs_options.useSync) {
	    chromeStorageMethod = chrome.storage.local;
	  } else {
	  	chromeStorageMethod = chrome.storage.sync;
	  }

  } else {
    chromeStorageMethod = chrome.storage.sync;
  }


  chromeStorageMethod.get("qjs_options", function(data) {

    if (!chrome.runtime.lastError) {

      console.log('default');
      loadPrefs(default_qjs_options);

    } else {

      console.log('data exist');
      loadPrefs(data);

    }

  });

}

function loadPrefs(data_options) {

	if (typeof prefs.qjs_options != "undefined") {
  	prefs.qjs_options = data_options;
  }

  //qjs rules
  if (typeof prefs.qjs_rules != "undefined") {
    clearRules("localStorage");
  } else {
    //rules = JSON.parse( window.localStorage.qjs_rules );
    rules = JSON.parse(prefs.qjs_rules);
  }

  // qjs_version
  var currentVersion = getVersion();
  var previousVersion = prefs.qjs_version || undefined;
  if (currentVersion != previousVersion) {
    if (typeof previousVersion == 'undefined') {
      onInstall();
    } else {
      onUpdate();
    }
    chromeStorageMethod.set({
      "qjs_version": currentVersion
    }, function() {
      console.log("version ok");
    });
  }

}

// Check if the version has changed.

function onInstall() {
  if (rules) {
    importRules(rules);
  }
}

function onUpdate() {
  console.log('update');
  // if old rules, save with the new method
  old_rules = JSON.parse(window.localStorage.qjs_rules);
  if (!rules.length && old_rules.length) {
    importRules(old_rules);
  }

  // else
  if (rules.length) {
    importRules(rules);
  }

}

function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}

function toggleContextMenu() {
  //console.log(prefs);
  if (prefs.qjs_options.showContextMenu && !contextMenuId) {

    contextMenuId = chrome.contextMenus.create({
      "title": "Go to JavaScript settings",
      "type": "normal",
      "contexts": ["all"],
      "onclick": openJsPanel()
    });

  }

  if (!prefs.qjs_options.showContextMenu && contextMenuId) {

    chrome.contextMenus.remove(contextMenuId);
    contextMenuId = null;

  }

}

function refresh() {
  toggleContextMenu();
}

function openJsPanel() {
  return function(info, tab) {
    chrome.tabs.create({
      "url": "chrome://chrome/settings/contentExceptions#javascript",
      "selected": true
    });
  };
}

function init() {

  getStoragePrefs();

}
