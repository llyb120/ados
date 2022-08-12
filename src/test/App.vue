<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
  }
}
</script>

<style lang="less">
*[tabindex]{
  outline: none;
}

html, body {
  /*width: 100%;*/
  /*height: 100%;*/
  margin: 0;
  padding: 0;
  background: #fff;
  /*overflow: hidden;*/
}
</style>