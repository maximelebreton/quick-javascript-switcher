<template>
  POPUP
</template>

<script>
export default {
  name: "options",
  data() {
    return {
      msg: "POPUP !!!!",
    };
  },
  unmounted() {
      chrome.runtime.sendMessage({ popupOpen: false });

  }
};
</script>

<style>
.main_app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
