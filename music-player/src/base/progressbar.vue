<template lang="html">
  <div class="progress-bar">
    <span class="time cur-time">0:45</span>
    <div class="bar-outter">
      <div class="bar-inner">
        <span class="bar-circle">
        </span>
      </div>
    </div>
    <span class="time all-time">4:34</span>
  </div>
</template>

<script>
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../common/scss/variable.scss';
.progress-bar {
    display: flex;
    align-items: center;
    .time {
        color: $color-text-ll;
        font-size: $font-size-small;
        margin: 0 5px;
    }
    .bar-outter {
        flex: 1;
        height: 6px;
        background-color: #000;
        .bar-inner {
            height: 100%;
            width: 20%;
            background-color: $color-theme;
            position: relative;
            .bar-circle {
                display: inline-block;
                border-radius: 50%;
                width: 14px;
                height: 14px;
                box-sizing: border-box;
                position: absolute;
                right: -4px;
                top: -4px;
                border: 3px solid #FFF;
                background-color: $color-theme;
            }
        }
    }
}
</style>
