/*
 * Quick Javascript Switcher Chrome Extension
 * http://github.com/maximelebreton/quick-javascript-switcher/
 *
 * GPL License. by Maxime Le Breton [www.maximelebreton.com]
 * Gear icon by Yusuke Kamiyamane
 */

var contextMenuId = null;

var chromeContentSettings = chrome.contentSettings;

var chromeStorageMethod;

var isIncognitoWindows = false;

var cache = {

  options: {
    "showContextMenu": true,
    "autoRefresh": true,
    "useSync": true
  },

  rules: []

}


init();

if (chromeContentSettings) {

  var extractHostname = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
    forbiddenOrigin = /(chrome\:\/\/|chrome-extension\:\/\/)/g,
    incognito,
    url,
    setting,
    tabId,
    matchForbiddenOrigin;

  chrome.tabs.onUpdated.addListener(function (tabId, props, tab) {
    // Prevent multiple calls
    if (props.status == "loading" && tab.selected) {
      //console.info("onUpdated");
      getSettings();
    }
  });

  chrome.tabs.onHighlighted.addListener(function () {
    //console.info("onHighlighted");
    getSettings();
  });

  chrome.windows.onFocusChanged.addListener(function () {
    //console.info("onFocusChanged");
    getSettings();
  });

  chrome.windows.getCurrent(function () {
    getSettings();
  });

  chrome.browserAction.onClicked.addListener(changeSettings);


  chrome.commands.onCommand.addListener(function (command) {
    if (command == "toggle-qjs") {
      changeSettings();
    }
  });

  chrome.storage.onChanged.addListener(function (callback) {

    for (var index in callback) {
      if (callback.hasOwnProperty(index)) {
        console.log(callback[index]);
        cache[index] = JSON.parse(callback[index].newValue);
        console.log(cache);
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

  chrome.tabs.query({
    'active': true,
    'windowId': chrome.windows.WINDOW_ID_CURRENT
  }, function (tabs) {
    var tab = tabs[0];

    if (tab) {

      console.log(tab);
      incognito = tab.incognito;
      url = tab.url;
      tabId = tab.id;

      //console.info("Current tab settings : "+url);
      chromeContentSettings.javascript.get({
          'primaryUrl': url,
          'incognito': incognito
        },
        function (details) {
          //console.info("Current tab settings : "+url);
          url ? matchForbiddenOrigin = url.match(forbiddenOrigin, '') : matchForbiddenOrigin = true;
          matchForbiddenOrigin ? updateIcon("inactive") : updateIcon(details.setting);
        });
    };
  });
}

function changeSettings() {

  if (!matchForbiddenOrigin) {
    chromeContentSettings.javascript.get({
        'primaryUrl': url,
        'incognito': incognito
      },
      function (details) {

        setting = details.setting;
        if (setting) {

          console.log(incognito);
          var pattern = /^file:/.test(url) ? url : url.match(extractHostname)[0] + '/*';

          // old method : url.replace(/\/[^\/]*?$/, '/*')
          var newSetting = (setting == 'allow' ? 'block' : 'allow');
          chromeContentSettings.javascript.set({
            'primaryPattern': pattern,
            'setting': newSetting,
            'scope': (incognito ? 'incognito_session_only' : 'regular')
          }, function () {

            updateIcon(newSetting);

            if (cache.options.autoRefresh) {
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

    //console.error("You can't disable javascript on "+url);

  }

}


function setStorageRule(pattern, newSetting) {

  if (!incognito) {

    var keyExist = false;

    if (cache.rules.length) {
      for (i = 0; i < cache.rules.length; i++) {
        if (pattern == cache.rules[i].primaryPattern) {
          cache.rules[i].setting = newSetting;
          keyExist = true;
          break;
        }
      }
    }

    if (!keyExist) {

      // to do : keep only block, only allow or both

      cache.rules.push({
        'primaryPattern': pattern,
        'setting': newSetting,
        'scope': (incognito ? 'incognito_session_only' : 'regular')
      });
    }

    //window.localStorage.setItem('qjs_rules',JSON.stringify(rules));
    chromeStorageMethod.set({
      "rules": JSON.stringify(cache.rules)
    }, function () {
      console.log("saved ok");
    });

  }

}

function importRules(importedRules) {

  var rules = importedRules;

  // todo : delete spaces

  if (importedRules.length) {
    for (i = 0; i < importedRules.length; i++) {

      chrome.contentSettings.javascript.set({
        'primaryPattern': rules[i].primaryPattern,
        'setting': rules[i].setting,
        'scope': rules[i].scope
      });
    }
  }

  //window.localStorage.setItem('qjs_rules',JSON.stringify(rules));
  chromeStorageMethod.set({
    "rules": JSON.stringify(importedRules)
  }, function () {
    cache.rules = importedRules;
    console.log("import ok");
  });

}

function clearRules(arg, incognito) {

  var incognito = incognito || false;

  if (arg == "contentSettings" || arg === undefined) {
    chromeContentSettings.javascript.clear({
      'scope': (incognito ? 'incognito_session_only' : 'regular')
    });
  }
  if (arg == "localStorage" || arg === undefined) {
    cache.rules = [];
    //window.localStorage.setItem('qjs_rules',[]);
    chromeStorageMethod.set({
      "rules": JSON.stringify([])
    }, function () {
      console.log("clear ok");
    });
  }
}

function checkVersion(callback) {

  /**
   * version storage need to be local
   */
  chrome.storage.local.get(['version'], function (data) {

    var oldValue = data['version'] || window.localStorage.qjs_version || undefined;
    var newValue = getVersion();

    if (oldValue !== newValue) {
      if (typeof oldValue == 'undefined') {
        onInstall();
      } else {
        onUpdate();
      }

      chrome.storage.local.set({
        "version": newValue
      }, function () {
        console.log("version ok");
      });

      if (callback) {
        callback();
      }
    }

  });

}

function getStoragePrefs(callback) {


  chrome.storage.sync.get(['options', 'rules'], function (data) {

    if (data['options']) {

      cache.options = JSON.parse(data['options']);
    }

    /*
     * set chrome storage method (local or sync) for options and rules
     */
    if (cache.options.useSync) {
      chromeStorageMethod = chrome.storage.sync;
    } else {
      chromeStorageMethod = chrome.storage.local;
    }

    if (data['rules']) {
      console.log(data['rules']);

      cache.rules = JSON.parse(data['rules']);
    } else {

      clearRules("localStorage");
    }

    if (callback) {
      callback();
    }

  });

}


// Check if the version has changed.

function onInstall() {
  console.log('install');
  if (cache.rules) {
    importRules(cache.rules);
  }
}

function onUpdate() {
  console.log('update');
  // if old rules, save with the new method
  old_rules = JSON.parse(window.localStorage.qjs_rules);
  if (!cache.rules.length && old_rules.length) {
    importRules(old_rules);
  }

  // else
  if (cache.rules.length) {
    importRules(cache.rules);
  }

}

function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}

function toggleContextMenu() {
  if (cache.options.showContextMenu && !contextMenuId) {

    contextMenuId = chrome.contextMenus.create({
      "title": "Go to JavaScript settings",
      "type": "normal",
      "contexts": ["all"],
      "onclick": openJsPanel()
    });

  }

  if (!cache.options.showContextMenu && contextMenuId) {

    chrome.contextMenus.remove(contextMenuId);
    contextMenuId = null;

  }

}

function refresh() {
  toggleContextMenu();
}

function openJsPanel() {
  return function (info, tab) {
    chrome.tabs.create({
      "url": "chrome://chrome/settings/contentExceptions#javascript",
      "selected": true
    });
  };
}

function initIncognitoClear() {

  chrome.windows.onCreated.addListener(function (window) {

    if (window.incognito) {
      isIncognitoWindows = true;
      console.log('window incognito')
    }
  });

  chrome.windows.onRemoved.addListener(function (windowId) {

    chrome.windows.getAll(function (windows) {

      windows.forEach(function (window) {

        if (window.incognito) {
          isIncognitoWindows = true;
        }
      });

      if (isIncognitoWindows) {
        console.log("clear incognito");
        clearRules("contentSettings", true);
        isIncognitoWindows = false;
      }

    });

  });
}

function init() {

  getStoragePrefs(function () {

    checkVersion();
    toggleContextMenu();

  });

  initIncognitoClear();
}
