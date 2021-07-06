console.log("DEVELOPMENT SERVICE WORKER");
try {
  importScripts("/js/background.js", "/hot-reload.js");
} catch (e) {
  console.log(e);
}
