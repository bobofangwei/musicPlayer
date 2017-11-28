<template>
  <div class="app">
    <m-header></m-header>
    <tab></tab>
  <keep-alive>
    <router-view></router-view>
  </keep-alive>
  <!--播放器组件与路由无关，是个全局组件，因此也放置在app.vue中-->
  <player></player>
  </div>
</template>
<script>
import mHeader from '@/components/mHeader/mHeader.vue'
import tab from '@/components/tab/tab.vue'
import player from '@/components/player/player.vue';
export default {
  name: 'app',
  components: {
    mHeader,
    tab,
    player
  }
}
</script>
<style>
</style>
