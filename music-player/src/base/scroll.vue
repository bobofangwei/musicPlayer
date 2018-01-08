<template lang="html">
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll';

export default {
  props: {
    // 1.滚动的时候触发scroll事件，会截流
    // 2.滚动的时候触发scroll事件，不会截流
    // 3.除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
    // 移动端有一些PC端没有的事件，诸如click,touch,tap,swipe等
    probeType: {
      type: Number,
      default: 1
    },
    // 点击列表是否触发click事件
    click: {
      type: Boolean,
      default: true
    },
    // 是否开启横向滚动,默认是竖向滚动
    scrollX: {
      type: Boolean,
      default: false
    },
    // 是否派发滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: null
    },
    // 是否派发滚动到底部的事件，用于下拉加载
    pullup: {
      type: Boolean,
      default: false
    },
    // 是否派发顶部下拉事件，用于下拉刷新
    pulldown: {
      type: Boolean,
      default: false
    },
    // 是否派发滚动开始事件
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 数据更新时，刷新scroll的延时
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted: function() {
    setTimeout(() => {
      this._initScroll();
    });
  },
  methods: {
    _initScroll: function() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click, // better-scroll组件默认会组织浏览器原生的click事件，当该属性设置为true，会派发一个click事件，并且派发的event参数有一个私有属性：_constructed,值为true
        scrollX: this.scrollX // 是否开启横向滚动
      });
      // 是否派发滚动事件
      if (this.listenScroll) {
        this.scroll.on('scroll', (pos) => {
          this.$emit('scroll', pos);
        });
      }
      // 是否派发滚动到底部事件，用于下拉加载
      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            this.$emit('pullup');
          }
        });
      }
      // 是否派发顶部下拉事件，用于下拉刷新
      if (this.pulldown) {
        this.scroll.on('touchend', (pos) => {
          if (pos.y > 50) {
            this.$emit('pulldown');
          }
        });
      }
      // 是否派发列表滚动开始事件
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll');
        });
      }
    },
    disable: function() {
      this.scroll && this.scroll.disable();
    },
    enable: function() {
      this.scroll && this.scroll.enable();
    },
    refresh: function() {
      this.scroll && this.scroll.refresh();
    },
    scrollTo: function() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    data: function(newVal) {
      console.log('refresh', newVal);
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
