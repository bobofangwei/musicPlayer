<template lang="html">
  <div class="progress-bar">
    <span class="time cur-time">{{timeFormat(curTime)}}</span>
    <!--组织默认事件，防止拖动浏览器-->
    <div class="bar-outter"  ref="outterBar" @click="progressClick" @touchstart.prevent="progressTouchStart"  @touchend.prevent="progressTouchEnd" @touchmove="progressTouchMove">
      <div class="bar-inner" ref="innerBar" :style="{width:percent*100+'%'}">
        <span class="bar-circle">
        </span>
      </div>
    </div>
    <span class="time all-time">{{timeFormat(totalTime)}}</span>
  </div>
</template>

<script>
import {
  paddingStart
} from '@/util/util.js';
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    },
    totalTime: {
      type: Number,
      default: 0
    },
    curTime: {
      type: Number,
      default: 0
    }
  },
  created() {
    // 用于不同方法之间的通信
    this.touch = {};
  },
  mounted() {},
  methods: {
    // 进度条的拖拽事件
    // 经过测试，在click事件中，会先后触发touchStart,touchEnd
    progressTouchStart(e) {
      // console.log('touchStart');
      this.touch.initiated = true;
      // 不能再mounted中获取，因为当时progressBar还没有展现，各个取值都为0
      this.progressBarWidth = this.$refs.outterBar.clientWidth;
      this.progressBarLeft = this.$refs.outterBar.getBoundingClientRect().left;
    },
    progressTouchEnd(e) {
      // console.log('touchEnd');
      this.touch.initiated = false;
      // 结束的时候，触发百分比改变事件
      this.$emit('percentChange', this.touch.curPercent);
    },
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      this._refreshWidth(e.touches[0].pageX - this.progressBarLeft);
    },
    _refreshWidth(curWidth) {
      // 貌似自组建不能更改父组件传递进来的prop
      // debugger
      let curPercent = curWidth / this.progressBarWidth;
      curPercent = curPercent > 1 ? 1 : (curPercent < 0 ? 0 : curPercent);
      this.touch.curPercent = curPercent;
      this.$refs.innerBar.style.width = curPercent * 100 + '%';
    },
    progressClick(e) {
      // console.log('click', e.pageX);
      this._refreshWidth(e.pageX - this.progressBarLeft);
      this.$emit('percentChange', this.touch.curPercent);
    },
    // 将秒转换为分：秒的形式
    timeFormat(seconds) {
      seconds = Math.round(seconds);
      let minite = Math.floor(seconds / 60);
      let sec = seconds % 60;
      return paddingStart('' + minite, 2, '0') + ':' + paddingStart('' + sec, 2, '0');
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
        margin: 0 15px;
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
