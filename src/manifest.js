module.exports = {
  manifest_version: 3,
  name: "Quick Javascript Switcher",
  description: "The one-click JavaScript Switcher",
  version: process.env.VUE_APP_VERSION.replace("-beta", ""),
  minimum_chrome_version: "16.0",
  homepage_url: "https://github.com/maximelebreton/quick-javascript-switcher",
  permissions: [
    "contextMenus",
    // "activeTab",
    "tabs",
    "contentSettings",
    "storage",
    "debugger",
  ],
  // optional_permissions: ["tabs"],
  incognito: "spanning",
  background: {
    service_worker: "service-worker.js",
    // scripts:
    //   process.env.NODE_ENV === "production"
    //     ? ["/js/background.js"]
    //     : ["/js/background.js", "/hot-reload.js"],
    // persistent: false,
  },
  icons: {
    16: "icons/logo-16.png",
    48: "icons/logo-48.png",
    128: "icons/logo-128.png",
    256: "icons/logo-256.png",
  },
  action: {
    default_icon: "icons/disabled@2x.png",
  },
  options_ui: {
    page: "options.html",
  },
  options_page: "options.html",
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
  commands: {
    // Doesn't work anymore with manifest v3, dont know why
    // _execute_action: {
    //   suggested_key: {
    //     default: "Alt+Shift+Q",
    //     windows: "Alt+Shift+Q",
    //     mac: "Alt+Shift+Q",
    //   },
    // },
    "handle-qjs-action": {
      suggested_key: {
        default: "Alt+Shift+Q",
        windows: "Alt+Shift+Q",
        mac: "Alt+Shift+Q",
      },
      description: "Enable / disable JavaScript",
    },
  },
};
