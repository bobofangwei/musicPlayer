<template lang="html">
  <div class="progress-circle">
    <slot></slot>
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg">
       <circle class="progress progress-background" cx="50" cy="50" r="50"  fill="transparent" />
       <!--<polygon points="40,35 80,50 40,75" fill="transparent" class="polygon"/>-->
       <circle class="progress progress-bar" cx="50" cy="50" r="50"  fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    radius: {
      type: Number,
      default: 0
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dashArray: Math.PI * 100
    };
  },
  computed: {
    dashOffset() {
      return (1 - this.percent) * this.dashArray;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../common/scss/variable.scss';
.progress-circle {
    position: relative;
    .progress {
        /*设置缩放的目的是为了，让图形在视口中全部显示*/
        stroke-width: 8px;
        transform-origin: 50% 50%;
    }
    .progress-background {
        stroke: $color-theme-d;
        transform: scale(0.9);
    }
    .polygon {
        stroke: $color-theme;
        transform: scale(0.9);
        stroke-width: 6px;
    }
    .progress-bar {
        stroke: $color-theme;
        transform: scale(0.9) rotate(-90deg);
    }
}
</style>
