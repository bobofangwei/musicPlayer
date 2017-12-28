<template lang="html">
  <div class="player" v-show="playList.length>0">
    <!--同时使用了css动画和js动画,一般情况下vue可以自动检测动画时间，因此这里的duration可选-->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave" duration="400">
    <!--<transition name="normal">-->
      <div class="normal-player" v-show="fullScreen">
        <div class="top">
          <div class="shrink" @click="shrink"><i class="icon-back"></i></div>
          <h1 class="title">{{currentSong.name}}</h1>
          <h2 class="subtitle">{{currentSong.singer}}</h2>
        </div>
        <div class="middle" @touchstart="middleTouchStart" @touchend="middleTouchEnd" @touchmove="middleTouchMove">
          <div class="middle-l cd" ref="middleL">
            <div class="cd-border" ref="cd" :class="[playing? 'play': 'pause']"><img :src="currentSong.image" class="cd-image" alt=""></div>
            <div class="single-line">{{curLyricTxt}}</div>
          </div>
          <scroll class="middle-r" :data="currentLyric.lines" v-if="currentLyric&&currentLyric.lines" ref="middleR">
            <!--歌词可以上下滑动-->
              <div class="lyric-wrapper" v-if="currentLyric&&currentLyric.lines">
                <p v-for="(line,index) in currentLyric.lines"   ref="lyricLine" :class="[index === currentLineNum? 'current': '', 'line']">{{line.txt}}</p>
              </div>
          </scroll>
        </div>
        <div class="play-pane">
          <div class="dot-wrapper">
            <span :class="[currentShow==='cd'?'active':'', 'dot']"></span>
            <span :class="[currentShow==='lyric'?'active':'', 'dot']"></span>
          </div>
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
    <transition name="mini" duration="400">
      <div class="mini-player" v-show="!fullScreen" @click="spread">
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
const transitionDuration = prefix('transitionDuration');

export default {
  data: function() {
    return {
      audioReady: false, // 标记auido元素是否准备好播放
      curTime: 0,
      currentLyric: null, // 当前歌曲的歌词对象
      currentLineNum: 0, // 当前播放到的歌词行数
      currentShow: 'cd', // 显示的是cd还是歌词
      curLyricTxt: '' // 当前播放的歌词
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
  created: function() {
    this.touchData = {};
  },
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
      // 歌词的播放进度也需要改变,单位是ms
      if (this.currentLyric) {
        this.currentLyric.seek(this.curTime * 1000);
      }
    },
    // 以下几个方法用于实现动画效果
    // 在全屏播放器展开的时候，mini播放器的cd类似于飞到全屏播放器cd的位置
    enter: function(el, done) {
      console.log('cd enter');
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
          duration: 400,
          easing: 'linear'
        }
      });
      keyframeAnimation.runAnimation(this.$refs.cd, 'move', done);
    },
    afterEnter: function(el) {
      console.log('cd afterEnter');
      keyframeAnimation.unregisterAnimation('move');
      // 清空animation
      this.$refs.cd.style.animation = '';
    },
    leave: function(el, done) {
      console.log('leave');
      // 使用教程里的transition和transform发现会出现transitionEnd以及afterLeave不能监听到的问题，
      // 因此这里依旧尝试使用keyFrameAnimation来解决
      const {
        x,
        y,
        scale
      } = this._getPosAndScale();
      let leaveKeyAnim = {
        0: {
          transform: 'translate3d(0, 0, 0) scale(1)'
        },
        100: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        }
      };
      keyframeAnimation.registerAnimation({
        name: 'leaveAnim',
        animation: leaveKeyAnim,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      });
      keyframeAnimation.runAnimation(this.$refs.cd, 'leaveAnim', done);
    },
    afterLeave: function(el) {
      keyframeAnimation.unregisterAnimation('leaveAnim');
      console.log('afterLeave');
    },
    // leave: function(el, done) {
    //   console.log('cd leave');
    //   // 从样式表中的样式，向其他样式动画，只需要借助css3的transform,transition即可
    //   // this.$refs.cd.style.transition = 'transform 0.2s';
    //   const {
    //     x,
    //     y,
    //     scale
    //   } = this._getPosAndScale();
    //   console.log(this.$refs.cd);
    //   this.$refs.cd.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    //   // 这里有问题
    //   // 测试发现，transitionend事件不会触发，导致afterLeave不被调用，导致过渡效果的leave-to和leave-active一直不会被删除
    //   // 导致normal-player不会切换成display:none的状态，而是一直是opacity的状态，从而导致页面不能被点击迄今上不太明白究竟是为什么
    //   this.$refs.cd.addEventListener('transitionend', () => {
    //     console.log('transitionEnd 调用done');
    //     done();
    //   });
    // },
    // afterLeave: function(el) {
    //   // 经过测试发现，afterLeave有时候不会触发，没搞懂什么原因
    //   console.log('cd afterLeave');
    //   // this.$refs.cd.style[transform] = '';
    //   // this.$refs.cd.style.transition = '';
    // },
    // 协助实现cd飞入的动画中位置和缩放的计算
    // 从normal-player到mini-player的飞入
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
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
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
      console.log('audioReady');
      // 防止上一首，下一首快速切换报错
      this.audioReady = true;
    },
    // audio Error事件的监听函数
    audioErrorHandler: function() {
      // 如果歌曲的链接有误，会触发此事件
      console.log('audioError');
      // 如果歌曲的url有问题，或者网络有问题，会触发auido的error的事件
      // 此时audioReady一直不会置为true,需要手动设置
      this.audioReady = true;
      // 如果url有误，应当停止播放,并在原来显示当前播放歌词的地方，显示一个出错的提示
      this.curLyricTxt = '歌曲资源获取不到';
      if (this.playing) {
        this.togglePlay();
      }
    },
    // audio元素自带的事件，诸如canplay,ended,error,timeupdate等
    audioUpdateTime: function(e) {
      this.curTime = e.target.currentTime;
    },
    // 歌曲播放完毕
    audioEnd: function() {
      console.log('curSong audio end');
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
      if (this.currentLyric) {
        // 循环播放下，歌词也需要回到一开始
        this.currentLyric.seek(0);
      }
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
        // console.log('lyricObject', this.currentLyric);
        if (this.playing) {
          this.currentLyric.play();
        }
      }).catch(() => {
        // 如果获取歌词出错
        this.currentLyric = null;
        this.currentLineNum = 0;
      });
    },
    // 歌词对象初始化构造函数中传入的构造函数
    // 在播放到每一句歌词的时候调用
    // 需要做的事情，高亮当前歌词行
    lyricHandler({
      lineNum,
      txt
    }) {
      this.currentLineNum = lineNum;
      this.curLyricTxt = txt;
      // 在这里处理歌词的滚动
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.middleR.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.middleR.scrollTo(0, 0, 1000);
      }
    },
    // 以下三个方法监听滑动事件，实现cd和歌词区域的切换
    // 监听移动端的滑动事件，在zepto下有swipeLeft,swipeRight等方法
    // 如果使用js原生的方法，那么就是检测touchStart,touchMove,touchEnd这三个事件
    // 基本思路是在touchStart事件里面获取startX,startY
    // 在touchEnd事件里面获取endX,endY
    // distanceX=endX-startX,如果为正的话向右滑动，为负的话向左滑动
    // distanceY=endY-startY,如果为正的话向下滑动，为负的话向上滑动
    // 因为一般不会是正上正下的滑动，因此还需要比较absolute(distanceX)与ansolute(distanceY)的大小，前者大为左右滑动，后者大为上下滑动
    // 但是上面有个问题，在andoid下，滑动事件只会触发touchStart和touchMove，在手指离开的时候，并不会触发touchEnd事件，只有在touchmove的默认事件取消之后，才会触发touchEnd事件
    // 所以，还需要对touchmove事件进行处理，思路是在用户刚开始滑动（第一次)的时候，判断用户是上下滑动，还是左右滑动，判断方法同上，并调用对应的e.prenventDefault()操作
    middleTouchStart(e) {
      // 该变量用来记录一次完整的滑动事件
      this.touchData.initiated = true;
      // 检测第一次滑动
      this.touchData.moved = false;
      let touch = e.targetTouches[0];
      this.touchData.startX = touch.pageX;
      this.touchData.startY = touch.pageY;
    },
    middleTouchMove(e) {
      if (!this.touchData.initiated) {
        return;
      }
      let touch = e.changedTouches[0];
      let deltaX = touch.pageX - this.touchData.startX;
      let deltaY = touch.pageY - this.touchData.startY;
      if (Math.abs(deltaY) < Math.abs(deltaX)) {
        // 说明是左右滑动
        if (!this.touchData.moved) {
          this.touchData.moved = true;
        }
        // 在左右滑动的同事，调整middleL和middlR的位置
        // middleR区域在不同currentShow的情况下，距离屏幕左侧的距离
        let left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        // lyric区域距离页面的坐标
        // lyric显示在屏幕上，translate的距离一定为复
        // 向右滑动的时候，deltaX为正，left为-window.innerHeight
        // 向左滑动的时候，deltaX为负，left为0
        // 这点的逻辑有点绕
        let offsetWidth = Math.min(0, Math.max(left + deltaX, -window.innerWidth));
        // 歌词区域占领屏幕的比例
        this.touchData.percent = Math.abs(offsetWidth / window.innerWidth);
        // this.$refs.middleR是scroll组件，不是dom元素，需要使用$el将DOM元素取出来
        this.$refs.middleR.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.middleR.$el.style[transitionDuration] = 0;
        // this.$refs.middleL就是个div，因此不需要使用$el再取出dom元素
        this.$refs.middleL.style['opacity'] = 1 - this.touchData.percent;
        this.$refs.middleL.style[transitionDuration] = 0;
        // 在touchmove中添加preventDefault()会阻止浏览器默认的滚动事件
        e.preventDefault();
      }
    },
    middleTouchEnd(e) {
      if (!this.touchData.initiated) {
        return;
      }
      // 为true说明是左右滑动
      if (!this.touchData.moved) {
        return;
      }
      let offsetWidth;
      let opacity;
      this.touchData.initiated = false;
      if (this.currentShow === 'cd') {
        if (this.touchData.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = 'lyric';
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if (this.touchData.percent < 0.9) {
          offsetWidth = 0;
          opacity = 1;
          this.currentShow = 'cd';
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      // this.$refs.middleR是scroll组件，不是dom元素，需要使用$el将DOM元素取出来
      this.$refs.middleR.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.middleR.$el.style[transitionDuration] = '300ms';
      // this.$refs.middleL就是个div，因此不需要使用$el再取出dom元素
      this.$refs.middleL.style['opacity'] = opacity;
      this.$refs.middleL.style[transitionDuration] = '300ms';
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
      // 歌词也需要停止
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
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
            white-space: nowrap;
        }
        /*middle-l,以及middle-r都需要定义为display:inline-block；以便二者能够左右并排*/
        .middle-l {
            display: inline-block;
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
            display: inline-block;
            width: 100%;
            height: 100%;
            overflow: hidden;
            text-align: center;
            .line {
                width: 80%;
                margin: 0 auto;
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
    /*头部下降，底部上升的感觉*/
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
