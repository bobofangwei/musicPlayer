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
      default: true
    },
    // 滚动间隔
    interval: {
      type: Number,
      default: 4000
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
    setTimeout(() => {
      this._setSliderWidth();
      this._initSlider();
      this._initDots();
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return;
        }
        this._setSliderWidth();
        this.slider.refresh();
      });
    }, 20);
    if (this.autoPlay) {
      this._play();
    }
  },
  beforeDestroy: function() {
    this.stopAutoPlay();
  },
  methods: {
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
        this.currentPageIndex = pageIndex;
        // console.log('pageIndex', pageIndex);
        // 在一屏滚动结束的时候，如果有滚动播放，则开启播放到下一屏
        if (this.autoPlay) {
          this._play();
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
    _play: function() {
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
