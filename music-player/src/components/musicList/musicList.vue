<template lang="html">
  <div class="musiclist-wrapper">
    <div class="photo-wrapper" :style="styleObject" ref="photoWrapper">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <h2 class="title">{{title}}</h2>
      <div class="play-wrapper" ref="playWrapper">
        <i class="icon-play"></i>
        <span class="play-text" @click.stop.prevent="randomPlay">随机播放全部</span>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="bgLayer"></div>
    <scroll ref="scroll" class="scroll" :probeType="probeType" :listenScroll="listenScroll" @scroll="handleScroll">
      <songlist :songs="songs" @selectSong="handleSongSelect"></songlist>
    </scroll>
  </div>

</template>

<script>
// 这个页面的难点
// 1.歌曲列表上拉和下滑的时候，实现类似原生ios的效果，借助于多个dom元素来完成
// 2.和vux相关的内容实现，诸如随机播放音乐，点击开始播放音乐等等
import scroll from '@/base/scroll.vue';
import loading from '@/base/loading/loading.vue';
import songlist from '@/base/songlist.vue';
import miniPlayerMixin from '@/base/mixin/miniPlayerMixin';
import {
  prefix
} from '@/util/dom.js';
import {
  mapActions
} from 'vuex';
const transform = prefix('transform');
const backdrop = prefix('backdrop-filter');
const RESERVED_HEIGHT = 30; // 歌曲列表能够滚动上移的最大高度
const MINIPLAYER_HEIGHT = '60px'; // 底部迷你播放器的高度
export default {
  mixins: [miniPlayerMixin],
  components: {
    scroll,
    loading,
    songlist
  },
  data() {
    return {
      scrollY: 0
    };
  },
  created() {
    this.probeType = 3;
    this.listenScroll = true;
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    handleScroll(pos) {
      this.scrollY = pos.y;
    },
    handleSongSelect(song, index) {
      // 1.设置播放器的playList为当前歌手的歌曲列表，即songs
      // 2.设置播放器的currentIndex
      // 3.设置播放器的fullScreen,以及playing状态
      // 更改vuex中的状态需要用到mutations,上述动作都统一封装到action中完成
      // 本来这里应该打开歌曲播放的页面，这里通过设置fullscreen来检测实现,player本身定义在首页app.vue中
      this.selectSong({
        list: this.songs,
        index: index
      });
    },
    // 随机播放所有歌曲
    randomPlay() {
      console.log('随机播放全部');
      this.randomPlayAll(this.songs);
    },
    // 实现mixin中的方法，完成播放器的底部适配
    handleMiniPlayer(playList) {
      const bottom = playList && playList.length > 0 ? MINIPLAYER_HEIGHT : '0';
      this.$refs.scroll.$el.style.bottom = bottom;
      // 记得列表的再次刷新调用
      this.$refs.scroll.refresh();
    },
    ...mapActions([
      'selectSong',
      'randomPlayAll'
    ])
  },
  watch: {
    scrollY(newVal) {
      // 为了实现歌曲列表滚动时候，达到类似于原生app的体验，
      // 1.向上拉动列表的时候，列表能够随之上升，最高能达到距离屏幕顶部RESERVED_HEIGHT的距离
      // 2.向下滚动列表的时候，上方的头像能够扩大，并且变形的origin是头部
      // 为了实现1的效果，取消了scroll的overflow属性，同时在scroll同级添加了bg-layer的同层元素，采用relative定位，高度为100%，当列表上移的时候，该bg-layer的元素也能够随之一起上移(调整其translateY的取值
      // 当bg-lay上移的高度到达RESERVED_HEIGHT的时候，需要调整photo的z-index，使得其能够覆盖bg-layer,并调整其高度等于RESERVED_HEIGHT
      // 为了实现2的效果，当列表下移的时候，为头像增添scale属性，并在css规定其transform-origin为top center
      // debugger
      let translateY = Math.max(newVal, this.minScrollHeight);
      let photoDom = this.$refs.photoWrapper;
      let blur = 0;
      let percent = Math.abs(newVal / this.photoHeight);
      if (newVal > 0) {
        // 扩大显示背景图片
        let scale = percent + 1;
        photoDom.style[transform] = `scale(${scale})`;
        photoDom.style.zIndex = 10;
        return;
      } else {
        // 如果向上移动，则利用backdrop-filter的css属性形成背景图片模糊的效果
        // 该属性在iphone可见，目前大部分浏览器（包括chrome）尚不支持
        blur = Math.min(20, 20 * percent);
      }
      // debugger
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
      this.$refs.bgLayer.style[transform] = `translate3d(0,${translateY}px,0)`;
      if (newVal < this.minScrollHeight) {
        photoDom.style.zIndex = 10;
        photoDom.style.height = `${RESERVED_HEIGHT}px`;
        photoDom.style.paddingTop = 0;
        this.$refs.playWrapper.style.display = 'none';
      } else {
        // 恢复正常样式
        photoDom.style.zIndex = 0;
        photoDom.style.paddingTop = '70%';
        photoDom.style.height = '';
        this.$refs.playWrapper.style.display = '';
      }
    }
  },
  computed: {
    styleObject() {
      return {
        'background-image': `url(${this.bgImage})`
      };
    }
  },
  mounted() {
    // 在这里控制scroll的高度，使其高度固定
    this.photoHeight = this.$refs.photoWrapper.clientHeight;
    this.$refs.scroll.$el.style.top = `${this.photoHeight}px`;
    this.minScrollHeight = -(this.photoHeight - RESERVED_HEIGHT);
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
.musiclist-wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;
    .photo-wrapper {
        position: relative;
        background-size: cover;
        padding-top: 70%;
        width: 100%;
        transform-origin: top center;
        .back {
            color: $color-theme;
            position: absolute;
            width: 30px;
            height: 30px;
            top: 10px;
            left: 10px;
            z-index: 10;
        }
        .title {
            color: #FFF;
            text-align: center;
            font-size: $font-size-medium-x;
            position: absolute;
            top: 10px;
            width: 100%;
            left: 0;
        }
        /*设置其z-index，防止点击的时候被layer遮挡*/
        .play-wrapper {
            position: absolute;
            z-index: 10;
            bottom: 20px;
            color: $color-theme;
            text-align: center;
            left: 50%;
            transform: translate3d(-50%, 0, 0);
            font-size: $font-size-small-s;
            padding: 5px 15px;
            border-radius: 15px;
            border: 1px solid #ffcd32;
            transiton: transform 0.3s linear;
            .icon-play {
                margin-right: 5px;
            }
        }
        /*该元素用于实现高斯模糊的效果*/
        .filter {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(7,17,27, 0.4);
        }
    }
    /*该dom元素主要用于实现当歌曲列表向上滚动的时候，充当超出overflow部分的背景层*/
    /*虽然高度等于整个屏幕的高度，但是竖直方向上的起始位置，一开始是个歌曲列表平齐的*/
    .bg-layer {
        position: relative;
        height: 100%;
        width: 100%;
        background-color: $color-background;
    }
    /*scroll的top值在mounted钩子里由js代码来控制的*/
    .scroll {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        /*overflow: hidden;*/
    }

}
</style>
