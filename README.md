## Welcome to the new Quick Javascript Switcher: v2.0

<div style="display: flex; flex-wrap: wrap;">
  <div markdown="1">
    
    
  [Quick JavaScript Switcher](https://chrome.google.com/webstore/detail/quick-javascript-switcher/geddoclleiomckbhadiaipdggiiccfje) (Chrome extension) has been designed just for one thing:  
  **Disable JavaScript on any site in one click.**
  
  He comes very popular for that (currently used by **+280 000 users!**), and had many many good reviews by users (**4.4 out of 5 based on 700+ rates**)
  
  Since few months, Chrome has evolved, some users [asked for new features](https://github.com/maximelebreton/quick-javascript-switcher/issues), and I had many ideas for QJS.  
  **So here is the new 2.0 version.**
  
  Please consider to support my work:
  </div>
  
  <div>
  <script async
    src="https://js.stripe.com/v3/buy-button.js">
  </script>
  
  <stripe-buy-button
    buy-button-id="buy_btn_1QAcSzIh8pk66UUulaNJ48EM"
    publishable-key="pk_live_LqLtM2EWjuxtsohHujofdnvI"
  >
  </stripe-buy-button>
  </div>
</div>



![qjs-main-screenshot](https://github.com/user-attachments/assets/ed240480-a3a2-4d85-b467-140f95ab1a6a)


### Better contextual menu, and Pause JS feature
Because the **most common cases** are to allow/block a **whole domain**, or a specific **subdomain**, these quick rules will be available on the context menu (right click on the QJS icon or on a page)! <small>(*You can find/edit them in the custom rules panel*)</small>

And sometimes you just need to pause JS without refreshing the whole page.  
Now it's possible with Pause JS feature!

![qjs-screenshot-2](https://github.com/user-attachments/assets/85c4e332-ef39-4a2c-8e18-87af1c1525ee)






![qjs-screenshot-3](https://github.com/user-attachments/assets/eedcd24f-a072-41f2-9bfe-36bcdf8b4115)

Based on **VueJS**, the next options interface will be more user friendly to manage your rules (search, add, edit, remove).  

Custom rules allow you to fine-tune your allow/block rules on every part of the url (scheme, subdomain, domain, port, path... etc...!)  
Let's take an example: If we want to **block javascript on every google.com domain except mail.google.com**.  
You can **enter these two rules through the new options interface** (or from the new contextual menu):  
**Block** `*.google.com/*`  
**Allow** `mail.google.com/*`

These rules follow [pattern precedence](https://developer.chrome.com/extensions/contentSettings#pattern-precedence), the **rule with the more specific pattern takes precedence.** 

**And you can sync these rules over your Chrome account settings.**



_________________________________________




### One last word, if you like my extensions

I've just released a new extension, **Bar Translate**, which allows you to **translate in any language without leaving the address bar** (Omnibox), when typing things like 'en bonjour' to get _hello_ (english), 'es hello' for _hola_ (spanish), or 'zh hello' for _你好_ (chinese).  
It's Open Source, with a buy if you love pricing model:  
[Bar Translate on the Chrome webstore](https://chrome.google.com/webstore/detail/bar-translate/inigdjcpofmlcigjhhiigigihmookhcp)

![Open Bar Translate on Chrome Webstore](https://i.kickstarter.com/assets/023/635/058/cb67ce6ee08e9831efba70c8f4808eff_original.png?fit=scale-down&origin=ugc&width=680&sig=4dnoBRf3xajuUagxxwDT9cZSJcUwy4hls0JTshkqaeY%3D)  
*Open Bar Translate on Chrome Webstore*

![Bar Translate - Quick tour](https://i.kickstarter.com/assets/023/629/157/ab9bbf7ee33a0c143d722b361aa6afd4_original.gif?fit=scale-down&origin=ugc&q=92&width=680&sig=7f6b7DvBqPjM%2FBFXDkA%2FoXNP3x3baEMpWz59Glq2RLo%3D)


