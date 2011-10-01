# ![](https://github.com/maximelebreton/quick-javascript-switcher/raw/master/icon-48.png "Quick Javascript Switcher") Quick Javascript Switcher (experimental Chrome extension) 

Quick Javascript Switcher is based on a Chrome Experimental API (experimental.contentSettings).  
This is why i currently can't publish it on the chrome web store.  
But it's very simple to install !

## How to install

1. First, you need to enable the [Experimental Extension API][experimental-api] on your browser.  
    
    You can do this in either of **two ways**:

  * Go to [chrome://flags][chrome-flags], find "Experimental Extension APIs", click its "Enable" link, and restart Chrome. From now on, unless you return to that page and disable experimental APIs, you'll be able to run extensions that use experimental APIs.
  * Or specify the --enable-experimental-extension-apis flag each time you launch the browser. On Windows, you can do this by modifying the properties of the shortcut that you use to launch Google Chrome. For example: `path_to_chrome.exe --enable-experimental-extension-apis`

2. [Download the extension][dl-extension] and extract the main folder where you want

3. Now go to the Extensions page ([chrome://extensions][chrome-extensions]), open the Developer mode, and click on "Load unpacked extension".
Find the extension folder, and that's all !

[dl-extension]:https://github.com/maximelebreton/quick-javascript-switcher/zipball/master
[chrome-extensions]:chrome://extensions
[chrome-flags]:chrome://flags
[experimental-api]:http://code.google.com/chrome/extensions/experimental.html