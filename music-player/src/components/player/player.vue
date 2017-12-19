<template lang="html">
  <div class="player" v-show="playList.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
      <div class="top">
      <div class="shrink" @click="shrink"><i class="icon-back"></i></div>
      <h1 class="title">{{currentSong.name}}</h1>
      <h2 class="subtitle">{{currentSong.singer}}</h2>
      </div>
      <!--左侧显示cd，右侧显示歌词,通过监听其touch事件达到这一效果-->
      <div class="middle" @touchstart.stop="middleTouchStart" @touchend.stop="middleTouchEnd" @touchmove.stop="middleTouchMove">
      <div class="middle-l cd"><div class="cd-border" ref="cd" :class="[playing? 'play': 'pause']"><img :src="currentSong.image" class="cd-image" alt=""></div><div class="single-line">乌云在我们心中留下阴影</div></div>
      <scroll class="middle-r" :data="currentLyric.lines" v-if="currentLyric&&currentLyric.lines">
        <!--歌词可以上下滑动-->
          <div class="lyric-wrapper" v-if="currentLyric&&currentLyric.lines">
            <p v-for="(line,index) in currentLyric.lines"  :class="[index === currentLineNum.lineNum? 'current': '', 'line']">{{line.txt}}</p>
          </div>
      </scroll>
    </div>

      <div class="play-pane">
        <div class="dot-wrapper"><span :class="[currentShow==='cd'?'active':'', 'dot']"></span><span :class="[currentShow==='lyric'?'active':'', 'dot']"></span></div>
        <div class="progress-wrapper">
          <progress-bar :percent="audioPercent" :curTime="curTime" :totalTime="currentSong.duration" @percentChange="percentChange"></progress-bar>
        </div>
        <div class="ope-wrapper">
          <div class="icon"><i :class="modeClass" @click="changePlayMode"></i></div>
          <div class="icon"><i class="icon-prev" @click="prevSong" :class="[audioReady?'':'disable']"></i></div>
          <div class="icon"><i :class="[playing? 'icon-pause': 'icon-play', audioReady?'':'disable']" @click="togglePlay"></i></div>
          <div class="icon"><i class="icon-next" @click="nextSong" :class="[audioReady?'':'disable']"></i></div>
          <div class="icon"><i class="icon-not-favorite"></i></div>
        </div>
      </div>

    </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-if="!fullScreen" @click="spread">
      <div class="cd-wrapper" >
        <img :src="currentSong.image" alt="" class="cd">
      </div>
      <div class="text-wrapper">
        <h2 class="song-name">{{currentSong.name}}</h2>
        <p class="song-singer">{{currentSong.singer}}</p>
      </div>
      <div class="ope-wrapper">
        <!--需要阻止子元素点击事件的冒泡，防止全屏播放器展开-->
      <progress-circle class="mini-icon pro-circle"  :radius="32" :percent="audioPercent">
        <i class="icon-mini" @click.stop="togglePlay" :class="[!playing? 'icon-play-mini': 'icon-pause-mini']"></i>
      </progress-circle>

        <div class="mini-icon"><i :class="modeClass" @click.prevent.stop="changePlayMode"></i></div>
      </div>

    </div>
    </transition>
    <!--使用html5的audio实现音乐器播放功能-->
    <!--如果上一首或者下一首快速切换的时候，可能会报错，为了解决这个问题，监听audio的canplay以及error事件-->
    <audio :src="currentSong.url" ref="audio" @ended="audioEnd" @canplay="audioReadyHandler" @error="audioErrorHandler" @timeupdate="audioUpdateTime"></audio>
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
import progressCircle from '@/base/progresscircle';
// create-keyframe-animation 第三方动画库，用于实现cd飞入的动画效果
import keyframeAnimation from 'create-keyframe-animation';
// 尝试使用velocity实现cd飞入的动画效果，但是没有实现
// import Velocity from 'velocity-animate';
import {
  prefix
} from '@/util/dom.js';
import {
  PLAYMODE
} from '@/common/js/config.js';
import {
  shuffle
} from '@/util/util.js';
import Lyric from 'lyric-parser';
import scroll from '@/base/scroll.vue';
const transform = prefix('transform');

export default {
  data: function() {
    return {
      audioReady: false, // 标记auido元素是否准备好播放
      curTime: 0,
      currentLyric: null, // 当前歌曲的歌词对象
      currentLineNum: 0, // 当前播放到的歌词行数
      currentShow: 'lyric' // 显示的是cd还是歌词
    }
  },
  computed: {
    ...mapGetters(['currentSong']),
    ...mapState(['playing', 'fullScreen', 'playList', 'sequenceList', 'mode', 'currentIndex']),
    audioPercent() {
      return this.curTime / (+this.currentSong.duration);
    },
    modeClass() {
      return this.mode === PLAYMODE.SEQUENCE ? 'icon-sequence' : (this.mode === PLAYMODE.LOOP ? 'icon-loop' : 'icon-random');
    }
  },
  created: function() {},
  components: {
    progressBar,
    progressCircle,
    scroll
  },
  methods: {
    // 正常的播放器收起，显示mini-player
    shrink: function() {
      this.setFullscreen(false);
    },
    spread: function() {
      this.setFullscreen(true);
    },
    // progressBar触发的percentChange事件传递到父组件
    percentChange: function(curPercent) {
      this.curTime = (+this.currentSong.duration) * curPercent;
      // 改变歌曲进度
      this.$refs.audio.currentTime = this.curTime;
      if (!this.playing) {
        this.togglePlay();
      }
    },
    // 以下几个方法用于实现动画效果
    // 在全屏播放器展开的时候，mini播放器的cd类似于飞到全屏播放器cd的位置
    enter: function(el, done) {
      // 从其他样式向样式表中配置的最终样式变化
      // 借助于keyframeAnimation
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
      keyframeAnimation.unregisterAnimation('move');
      // 清空animation
      this.$refs.cd.style.animation = '';
    },
    leave: function(el, done) {
      // 从样式表中的样式，向其他样式动画，只需要借助css3的transform,transition即可
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
      // 小cd的位置信息
      const miniWidth = 40;
      const miniLeft = 30;
      const miniBottom = 10;
      // 高度和宽度是一样的
      // 大cd的位置信息
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
    // 切换歌曲的播放与暂停
    togglePlay: function(e) {
      this.setPlaying(!this.playing);
      // 拒绝命令式代码，通过判断this.playing的真假，决定是播放还是暂停
      // 通过下面watchplaying来决定
    },
    // 上一首歌
    prevSong: function() {
      console.log('prev audioReady', this.audioReady);
      if (!this.audioReady) {
        return;
      }
      let index = this.currentIndex - 1;
      if (index < 0) {
        index = this.playList.length - 1;
      }
      this.setCurrentindex(index);
      // 如果在暂停状态下点击上一首或者下一首，那么上一首或者下一首自动开始播放
      if (!this.playing) {
        this.togglePlay();
      }
      this.audioReady = false;
    },
    // 下一首歌
    nextSong: function() {
      if (!this.audioReady) {
        return;
      }
      let index = this.currentIndex + 1;
      if (index >= this.playList.length) {
        index = 0;
      }
      // 下面的操作会导致currentSong发生变化，触发currentSong的watch事件
      this.setCurrentindex(index);
      if (!this.playing) {
        this.togglePlay();
      }
      // 触发歌曲改变
      this.audioReady = false;
    },
    // audio Ready事件的监听函数
    // 当audio的src属性发生变化时，会检测这一事件
    audioReadyHandler: function() {
      // 防止上一首，下一首快速切换报错
      this.audioReady = true;
    },
    // audio Error事件的监听函数
    audioErrorHandler: function() {
      // 如果歌曲的url有问题，或者网络有问题，会触发auido的error的事件
      // 此时audioReady一直不会置为true,需要手动设置
      this.audioReady = true;
    },
    // audio元素自带的事件，诸如canplay,ended,error,timeupdate等
    audioUpdateTime: function(e) {
      this.curTime = e.target.currentTime;
    },
    // 歌曲播放完毕
    audioEnd: function() {
      // 在不考虑循环的条件下，播放下一首
      if (this.mode === PLAYMODE.LOOP) {
        this.loop();
      } else {
        this.nextSong();
      }
    },
    // 循环播放某首歌曲
    loop: function() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      this.setPlaying(true);
    },
    // 切换播放模式，一共有三种
    // 0:顺序，1：循环；2：随机
    // 顺序与随机播放通过改变playlist来实现
    // 循环播放通过监听audio的ended事件来完成
    changePlayMode: function() {
      let mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      console.log('mode', this.mode);
      // 如果是随机播放
      let curPlayList;
      if (mode === PLAYMODE.RANDOM) {
        curPlayList = shuffle(this.sequenceList);
      } else {
        curPlayList = this.sequenceList;
      }
      // 切换播放模式不应该影响当前歌曲的播放，而currentSong是由playList[currentIndex]计算出来的，可能因为playList的改变而发生改变，因此需要重新寻找歌曲的位置
      let index = curPlayList.findIndex((item) => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentindex(index);
      this.setPlayList(curPlayList);
    },
    // 处理歌词播放和歌词轮播等
    getLyric() {
      this.currentSong.getSongLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.lyricHandler);
        console.log('lyricObject', this.currentLyric);
        if (this.playing) {
          this.currentLyric.play();
        }
      });
    },
    // 歌词对象初始化构造函数中传入的构造函数
    // 在播放到每一句歌词的时候调用
    // 需要做的事情，高亮当前歌词行
    lyricHandler(lineNum, lineTxt) {
      this.currentLineNum = lineNum;
    },
    ...mapMutations({
      setFullscreen: types.SET_FULLSCREEN,
      setPlaying: types.SET_PLAYING,
      setCurrentindex: types.SET_CURRENTINDEX,
      setPlayMode: types.SET_PLAYMODE,
      setPlayList: types.SET_PLAYLIST
    })
  },
  watch: {
    // 在currentsong发生变化的时候，播放播放器
    // 在初始加载，currentIndex被修改的时候，都能触发currentSong的修改
    currentSong(newSong, oldSong) {
      if (newSong.id === oldSong.id) {
        return;
      }
      console.log('currentSong change', this.currentSong);
      this.$nextTick(function() {
        this.$refs.audio.play();
        this.getLyric();
      });
    },
    // 监听play的变化，决定是播放还是暂停
    // 播放器播放功能实现
    playing(newVal) {
      const audio = this.$refs.audio;
      this.$nextTick(function() {
        newVal ? audio.play() : audio.pause();
      });
    }
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
        .middle {
            position: absolute;
            width: 100%;
            top: 80px;
            left: 0;
            bottom: 170px;
        }
        .middle-l {
            position: relative;
            text-align: center;
            width: 100%;
            height: 0;
            padding-top: 80%;
            box-sizing: border-box;
            text-align: center;
            .cd-border {
                position: absolute;
                left: 10%;
                top: 0;
                width: 80%;
                height: 100%;
                display: inline-block;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
                transform-origin: 50% 50%;
                &.play {
                    animation: rotate 10s linear infinite;
                }
                &.pause {
                    animation-play-state: paused;
                }
                .cd-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
            }
        }
        /*歌词部分的布局*/
        .middle-r {
            position: absolute;
            top: 0;
            left: 10%;
            width: 80%;
            height: 100%;
            overflow: hidden;
            text-align: center;
            .line {
                line-height: 32px;
                height: 32px;
                font-size: $font-size-medium;
                color: $color-text-l;
                &.current {
                    color: $color-text;
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
                    &.disable {
                        color: #333;
                    }
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
                &.play {
                    animation: rotate 10s linear infinite;
                }
                &.pause {
                    animation-play-state: puased;
                }
            }
        }
        .text-wrapper {
            position: absolute;
            left: 80px;
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
            right: 5px;
            top: 10px;
            .mini-icon {
                float: left;
                width: 32px;
                height: 32px;
                text-align: center;
                line-height: 32px;
                font-size: 28px;
                color: $color-theme;
                &:last-child {
                    margin-left: 5px;
                }
            }
            .icon-mini {
                position: absolute;
                top: 0;
                left: 0;
                font-size: 32px;
                color: $color-theme-d;
            }
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
    /*cd旋转的动画效果*/
    @keyframes rotate {
        0% {
            transform: rotate(0);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>
