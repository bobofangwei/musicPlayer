<template lang="html">
  <div class="player" v-show="playList.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
    <div class="normal-player" v-show="fullScreen" >
      <div class="top">
      <div class="shrink" @click="shrink"><i class="icon-back"></i></div>
      <h1 class="title">{{currentSong.name}}</h1>
      <h2 class="subtitle">{{currentSong.singer}}</h2>
      </div>
      <div class="cd"><div class="cd-border" ref="cd"><img :src="currentSong.image" class="cd-image" alt=""></div><div class="single-line">乌云在我们心中留下阴影</div></div>


      <div class="play-pane">
        <div class="dot-wrapper"><span class="dot active"></span><span class="dot"></span></div>
        <div class="progress-wrapper">
          <progress-bar :percent="20"></progress-bar>
        </div>
        <div class="ope-wrapper">
          <div class="icon"><i class="icon-sequence"></i></div>
          <div class="icon"><i class="icon-prev"></i></div>
          <div class="icon"><i class="icon-play"></i></div>
          <div class="icon"><i class="icon-next"></i></div>
          <div class="icon"><i class="icon-not-favorite"></i></div>
        </div>
      </div>

    </div>
    </transition>
    <transition name="mini">
    <div class="mini-player" v-show="!fullScreen" @click="spread">
      <div class="cd-wrapper">
        <img :src="currentSong.image" alt="" class="cd">
      </div>
      <div class="text-wrapper">
        <h2 class="song-name">{{currentSong.name}}</h2>
        <p class="song-singer">{{currentSong.singer}}</p>
      </div>
      <div class="ope-wrapper">
        <div class="icon"><i class="icon-next"></i></div>
        <div class="icon"><i class="icon-next"></i></div>
      </div>

    </div>
    </transition>
  </div>

</template>

<script>
import {
  mapGetters,
  mapState,
  mapMutations
} from 'vuex';
import * as types from '@/store/mutation_types.js';
import progressBar from '@/base/progressbar';
// create-keyframe-animation 第三方动画库，用于实现cd飞入的动画效果
import keyframeAnimation from 'create-keyframe-animation';
// 尝试使用velocity实现cd飞入的动画效果，但是没有实现
// import Velocity from 'velocity-animate';
import {
  prefix
} from '@/util/dom.js';
const transform = prefix('transform');

export default {
  computed: {
    ...mapGetters(['currentSong']),
    ...mapState(['playing', 'fullScreen', 'playList', 'sequenceList', 'mode'])
  },
  created: function() {
    console.log('currentSong', this.currentSong);
  },
  components: {
    progressBar
  },
  methods: {
    // 正常的播放器收起，显示mini-player
    shrink: function() {
      this.setFullscreen(false);
    },
    spread: function() {
      this.setFullscreen(true);
    },
    // 以下几个方法用于实现动画效果
    // 在全屏播放器展开的时候，mini播放器的cd类似于飞到全屏播放器cd的位置
    enter: function(el, done) {
      const {
        x,
        y,
        scale
      } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      };
      keyframeAnimation.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 500,
          easing: 'linear'
        }
      });
      keyframeAnimation.runAnimation(this.$refs.cd, 'move', done);
    },
    afterEnter: function(el) {
      // keyframeAnimation.unregisterAnimation('move');
      // 清空animation
      this.$refs.cd.style.animation = '';
    },
    leave: function(el, done) {
      this.$refs.cd.style.transition = 'all 400ms';
      const {
        x,
        y,
        scale
      } = this._getPosAndScale();
      this.$refs.cd.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      this.$refs.cd.addEventListener('transitionend', done);
    },
    afterLeave: function(el) {
      this.$refs.cd.style[transform] = '';
      this.$refs.cd.style.transition = '';
    },
    // 协助实现cd飞入的动画中位置和缩放的计算
    // 从mini-player到normal-player的飞入
    _getPosAndScale: function() {
      const miniWidth = 40;
      const miniLeft = 30;
      const miniBottom = 10;
      // 高度和宽度是一样的
      const normalWidth = window.innerWidth * 0.8;
      const normalTop = 80;
      let x = -(window.innerWidth / 2 - miniLeft - miniWidth / 2);
      let y = window.innerHeight - normalTop - normalWidth / 2 - miniBottom - miniWidth / 2;
      let scale = miniWidth / normalWidth;
      // let x = -(window.innerWidth / 2 - miniLeft);
      // let y = window.innerHeight - normalTop - normalWidth / 2 - miniBottom - miniWidth / 2;
      return {
        x,
        y,
        scale
      };
    },
    ...mapMutations({
      setFullscreen: types.SET_FULLSCREEN
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
.player {
    .normal-player {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: $color-background;
        .shrink {
            color: $color-theme;
            transform: rotate(-90deg);
            position: absolute;
            width: 30px;
            height: 30px;
            line-height: 30px;
            top: 0;
            left: 5px;
        }
        .title {
            text-align: center;
            font-size: $font-size-medium-x;
            padding: 15px 0;
        }
        .subtitle {
            text-align: center;
            font-size: $font-size-medium;
        }
        .cd {
            position: absolute;
            top: 80px;
            left: 0;
            text-align: center;
            width: 100%;
            height: 0;
            padding-top: 80%;
            box-sizing: border-box;
            text-align: center;
            .cd-border {
                position: absolute;
                top: 0;
                left: 10%;
                width: 80%;
                height: 100%;
                display: inline-block;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
                transform-origin: 50% 50%;
                .cd-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
            }
        }
        .single-line {
            text-align: center;
            color: $color-text-l;
            font-size: $font-size-small;
            margin-top: 30px;
        }
        .play-pane {
            position: absolute;
            width: 100%;
            bottom: 30px;
            .dot-wrapper {
                text-align: center;
                .dot {
                    width: 10px;
                    height: 10px;
                    display: inline-block;
                    border-radius: 5px;
                    background-color: rgba(255,255,255,.5);
                    margin: 5px;
                    &.active {
                        width: 25px;
                        background-color: #FFF;
                    }
                }
            }
            .progress-wrapper {
                padding: 20px;
            }
            .ope-wrapper {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                .icon {
                    color: $color-theme;
                    font-size: 30px;
                }
            }
        }

    }
    .mini-player {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 60px;
        background-color: $color-highlight-background;
        .cd-wrapper {
            position: absolute;
            left: 30px;
            top: 10px;
            .cd {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
        }
        .text-wrapper {
            position: absolute;
            left: 60px;
            top: 10px;
            .song-name {
                font-size: $font-size-medium;
                color: #FFF;
            }
            .song-singer {
                font-size: $font-size-medium;
                color: $color-text-l;
                margin-top: 10px;
            }
        }
        .ope-wrapper {
            position: absolute;
            right: 10px;
            top: 10px;
        }
    }
    .normal-enter,
    .normal-leave-to {
        opacity: 0;
        .top {
            transform: translate3d(0,-100px,0);
        }
        .play-pane {
            transform: translate3d(0,100px,0);
        }
    }
    .normal-enter-active,
    .normal-leave-active {
        transition: all 0.4s;
        .play-pane,
        .top {
            transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
    }
    .mini-enter,
    .mini-leave-to {
        opacity: 0;
    }
    .mini-enter-active,
    .mini-leave-active {
        transition: all 0.4s;
    }
}
</style>
