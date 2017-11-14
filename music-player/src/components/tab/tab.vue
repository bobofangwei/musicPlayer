<template lang="html">
  <ul class="tab-list">
    <li class="tab-item">
      <router-link class="tab-link" :to="{ name: 'recommend' }"><span class="tab-text">推荐</span></router-link class="tab-link">
    </li>
    <li class="tab-item">
      <router-link class="tab-link" :to="{ name: 'singer', path: '/singer'}"><span class="tab-text">歌手</span></router-link class="tab-link">
    </li>
    <li class="tab-item">
      <router-link class="tab-link" :to="{ name: 'rank'}"><span class="tab-text">排行</span></router-link class="tab-link">
    </li>
    <li class="tab-item">
      <router-link class="tab-link" :to="{ name: 'search'}"><span class="tab-text">搜索</span></router-link class="tab-link">
    </li>
  </ul>
</template>

<script>
export default {}
</script>

<style lang="scss">
@import "../../common/scss/variable.scss";
.tab-list {
    width: 100%;
    height: 44px;
    background: $color-background-d;
    overflow: hidden;
    .tab-item {
        width: 25%;
        float: left;
        .tab-link {
            display: block;
            height: 44px;
            line-height: 44px;
            color: $color-text;
            text-align: center;
            font-size: $font-size-medium;
            &.router-link-active .tab-text {
                color: $color-theme;
                display: inline-block;
                border-bottom: 2px solid $color-theme;
            }
        }
    }
}
</style>
