# ![](https://github.com/maximelebreton/quick-javascript-switcher/raw/master/icon-48.png "Quick Javascript Switcher") Quick Javascript Switcher (experimental Chrome extension) 

Quick Javascript Switcher is a Chrome Extension to enable / disable javascript 'on the fly'.  
QJS is based on a Chrome Experimental API (experimental.contentSettings), this is why i currently can't publish it on the chrome web store.  
But it's very simple to install (2 steps) !

[Download Quick Javascript Switcher][crx-extension] (.crx)

## How to install

1. First, you need to **enable the [Experimental Extension API][experimental-api]** on your browser, and **reboot Chrome**.  
    
    You can do this in either of **two ways**:

  * Go to [chrome://flags][chrome-flags], find "Experimental Extension APIs", click its "Enable" link, and restart Chrome. From now on, unless you return to that page and disable experimental APIs, you'll be able to run extensions that use experimental APIs.
  * Or specify the --enable-experimental-extension-apis flag each time you launch the browser. On Windows, you can do this by modifying the properties of the shortcut that you use to launch Google Chrome. For example: `path_to_chrome.exe --enable-experimental-extension-apis`

2. [Download the .crx extension][crx-extension] and just press *continue*.

That's all !

## Install as unpacked extension

Enable [Experimental Extension API][experimental-api], [download the .zip extension][zip-extension], go to the Extensions page ([chrome://extensions][chrome-extensions]), open the Developer mode, and click on "Load unpacked extension".
Find the extension folder, and press *ok*.

[crx-extension]:https://github.com/downloads/maximelebreton/quick-javascript-switcher/quick-javascript-switcher.crx
[zip-extension]:https://github.com/maximelebreton/quick-javascript-switcher/zipball/master
[chrome-extensions]:chrome://extensions
[chrome-flags]:chrome://flags
[experimental-api]:http://code.google.com/chrome/extensions/experimental.html