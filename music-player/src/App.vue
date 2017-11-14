<template>
  <div class="app">
    <m-header></m-header>
    <tab></tab>
  <keep-alive>
    <router-view></router-view>
  </keep-alive>
  </div>
</template>
<script>
import mHeader from '@/components/mHeader/mHeader.vue'
import tab from '@/components/tab/tab.vue'
export default {
  name: 'app',
  components: {
    mHeader,
    tab
  }
}
</script>
<style>
</style>
