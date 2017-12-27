<template lang="html">
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{'active': index===currentPageIndex}"></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll';
import {
  addClass
} from '@/util/dom.js';
export default {
  name: 'slider',
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    // 滚动间隔
    interval: {
      type: Number,
      default: 4000
    },
    showDot: {
      type: Boolean,
      default: true
    },
    click: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      dots: [],
      currentPageIndex: 0
    };
  },
  mounted: function() {
    // 也可以使用nextTick
    if (this.slider) {
      this.slider.destroy();
    }
    this.$nextTick(() => {
      this.init();
    });
    window.addEventListener('resize', () => {
      console.log('resize');
      if (!this.slider) {
        return;
      }
      // 接下来和初始化的代码类似，除了不需要创建bscroll，以及不需要初始化dots
      this._setSliderWidth();
      setTimeout(() => {
        this.slider.refresh();
      }, 20);
      if (this.autoPlay) {
        this._next();
      }
    });
  },
  beforeDestroy: function() {
    this.slider.disable();
    this.stopAutoPlay();
  },
  // 下面两个事件钩子在keep-alive的环境下发挥作用
  activated: function() {
    if (!this.slider) {
      return;
    }
    // 启用better-scroll
    this.slider.enable();
    // 单纯的启用还不行，如果之前开启了自动播放，activated之后，并不会自动恢复自动播放
    if (this.autoPlay) {
      this._next();
    }
  },
  deactivated: function() {
    // 禁用better-scroll，相关事件touchStart,touchEnd都不再响应
    this.slider.disable();
    this.stopAutoPlay();
  },
  methods: {
    // 初始化操作
    // 包括设置容器宽度
    // 创建slider
    // 如果开启了自动播放，则播放到下一页
    init: function() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.currentPageIndex = 0;
      this._setSliderWidth();
      if (this.showDot) {
        this._initDots();
      }
      this._initSlider();
      // 必须加上setTimeout或者nextTick，否则会出现页面初次加载滚动报错的问题
      this.$nextTick(() => {
        this.slider.refresh();
      });
      if (this.autoPlay) {
        this._next();
      }
    },
    _setSliderWidth: function() {
      this.children = this.$refs.sliderGroup.children;
      this.count = this.children.length;
      // console.log('count', this.count);
      let width = 0;
      let sliderWidth = this.$refs.slider.clientWidth;
      for (let i = 0, len = this.children.length; i < len; i++) {
        let child = this.children[i];
        addClass(child, 'slider-item');
        child.style.width = sliderWidth + 'px';
        width += sliderWidth;
      }
      if (this.loop) {
        width += 2 * sliderWidth;
      }
      this.$refs.sliderGroup.style.width = width + 'px';
    },
    _initSlider: function() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false, // 当快速滑动时是否开启滑动惯性
        bounce: false,
        click: this.click,
        snap: {
          loop: this.loop,
          threshold: 0.2,
          speed: 400
        }
      });
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX;
        // 如果开启了循环无缝轮播，那么下标是从1开始，因此需要减去1
        if (this.loop) {
          pageIndex -= 1;
        }
        console.log('scrollEnd', pageIndex);
        // currentPageIndex决定着dot的样式
        this.currentPageIndex = pageIndex;
        // 自动滚动的原理即在于，监听滚动结束事件，在监听函数中，执行让页面滚动到下一页的操作
        // 在一屏滚动结束的时候，如果有滚动播放，则开启播放到下一屏
        if (this.autoPlay) {
          this._next();
        }
      });
      this.slider.on('beforeScrollStart', () => {
        if (this.autoPlay) {
          this.stopAutoPlay();
        }
      });
    },
    _initDots: function() {
      this.dots = new Array(this.count);
    },
    stopAutoPlay: function() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    // 自动轮播时调用
    // 自动滚动到下一个页面
    _next: function() {
      // 其实slider本身也有一个next方法，可以代替这段代码
      let pageIndex = this.currentPageIndex + 1;
      if (this.loop) {
        pageIndex += 1;
      }
      this.timer = setTimeout(() => {
        // snap为true的时候，代表滚动到对应的页面
        // goToPage(x,y,time,easing),x为横向页面索引，y为纵向页面索引，time为动画时间，easing为缓动动画类型
        this.slider.goToPage(pageIndex, 0, 400);
      }, this.interval);
    }
  }
}
</script>

<style lang="scss">
.slider {
    width: 100%;
    position: relative;
    .slider-group {
        overflow: hidden;
        .slider-item {
            float: left;
            overflow: hidden;
            box-sizing: border-box;
            text-align: center;
            a {
                display: block;
                width: 100%;
                text-decoration: none;
                img {
                    display: block;
                    width: 100%;
                }
            }
        }
    }
    .dots {
        text-align: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        .dot {
            cursor: pointer;
            display: inline-block;
            width: 6px;
            height: 6px;
            margin: 3px;
            border-radius: 50%;
            background: #999;
            &.active {
                background: #FFF;
            }
        }
    }
}
</style>
