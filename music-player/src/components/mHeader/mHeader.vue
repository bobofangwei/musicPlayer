<template>
  <div class="header">
    <div class="logo"></div>
    <h2 class="title">Bobo Music</h2>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
@import "../../common/scss/mixin.scss";
@import "../../common/scss/variable.scss";
.header {
  width: 100%;
  height: 44px;
  text-align: center;
  line-height: 44px;
  .logo {
    @include bg-image("./logo");
    width: 30px;
    height: 32px;
    margin-top: 6px;
    margin-right: 10px;
    display: inline-block;
    background-size: 100% 100%;
    vertical-align: top;
  }
  .title {
    display: inline-block;
    font-size: $font-size-large;
    line-height: 44px;
    height: 44px;
    vertical-align: top;
  }
}
</style>
