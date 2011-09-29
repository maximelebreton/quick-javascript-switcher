# How to install

Quick Javascript Switcher is based on a Chrome Experimental API (experimental.contentSettings).

You can do this in either of two ways:

* Go to chrome://flags, find "Experimental Extension APIs", click its "Enable" link, and restart Chrome. From now on, unless you return to that page and disable experimental APIs, you'll be able to run extensions that use experimental APIs.
*Specify the --enable-experimental-extension-apis flag each time you launch the browser. On Windows, you can do this by modifying the properties of the shortcut that you use to launch Google Chrome. For example: `path_to_chrome.exe --enable-experimental-extension-apis`