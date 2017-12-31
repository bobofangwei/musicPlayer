<template lang="html">
  <scroll class="listview" ref="scroll" :data="data" :listen-scroll="listenScroll" :probe-type="probeType" @scroll="scroll">
    <ul class="list">
      <li class="list-group" ref="listGroup" v-for="group in data">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item" v-for="item in group.items" @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <ul class="shortcut-list" @touchstart.stop.prevent="handleShortcutTouchStart" @touchmove.stop.prevent="handleShortcutTouchMove" @touchend.stop.prevent>
      <li v-for="(item,index) in shortcutList" class="shortcut-item" :data-index="index" :class="{active: currentIndex===index}">{{item}}</li>
    </ul>
    <div class="loading-wrapper" v-show="!data.length">
      <loading></loading>
    </div>
    <div class="fixed-title" ref="fixedTitle">{{curTitle}}</div>
  </scroll>
</template>

<script>
import scroll from '@/base/scroll.vue';
import loading from '@/base/loading/loading.vue';
import miniPlayerMixin from '@/base/mixin/miniPlayerMixin';
// 区域标题的高度
const TITLE_HEIGHT = 30;
const ANCHOR_HEIGHT = 18;
const MINIPLAYER_HEIGHT = '60px'; // 底部迷你播放器的高度

// 左右列表联动的效果
// 在scroll中派发scroll事件，时刻记录滚动高度scrollY
// 使用一个数组记录每个区域距离顶部的高度，watch data的变化，每一次数据发生变化的时候都重新计算
// 计算scrollY落在哪一个区间，从而计算处currentIndex
// 此外，还有一个动画效果的实现经验值得学习，即标题向上推的效果实现
export default {
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  mixins: [miniPlayerMixin],
  components: {
    scroll,
    loading
  },
  data: function() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    };
  },
  computed: {
    shortcutList: function() {
      return this.data.map((group) => {
        return group.title.substr(0, 1);
      });
    },
    curTitle: function() {
      let ret = this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
      return ret;
    }
  },
  created: function() {
    this.listenScroll = true;
    this.probeType = 3;
    this.heights = [];
  },
  methods: {
    scroll: function(pos) {
      this.scrollY = pos.y;
    },
    calHeight: function() {
      this.heights = [];
      // 计算各个区域的高度区间
      let lis = this.$refs.listGroup;
      let curHeight = 0;
      this.heights.push(curHeight);
      for (let i = 0, len = lis.length; i < len; i++) {
        curHeight += lis[i].clientHeight;
        this.heights.push(curHeight);
      }
    },
    handleShortcutTouchStart: function(e) {
      let index = parseInt(e.target.dataset.index, 10);
      this.touchStartY = e.touches[0].pageY;
      this.touchStartIndex = index;
      this._scrollToIndex(index);
    },
    handleShortcutTouchMove: function(e) {
      this.touchEndY = e.touches[0].pageY;
      let curIndex = parseInt(this.touchStartIndex + (this.touchEndY - this.touchStartY) / ANCHOR_HEIGHT, 10);
      this._scrollToIndex(curIndex);
    },
    _scrollToIndex: function(index) {
      if (index <= 0) {
        index = 0;
      } else if (index > this.heights - 2) {
        index = this.heights - 2;
      }
      this.currentIndex = index;
      this.scrollY = -this.heights[index];
      this.$refs.scroll.scrollToElement(this.$refs.listGroup[index]);
    },
    refresh: function() {
      this.$refs.scroll.refresh();
    },
    selectItem: function(item) {
      this.$emit('selectItem', item);
    },
    // 迷你播放器出现时的高度调整问题
    handleMiniPlayer(playList) {
      // console.log('musicList,handleMiniPlayer', this.playList.length > 0);
      const bottom = playList && playList.length > 0 ? MINIPLAYER_HEIGHT : '0';
      this.$refs.scroll.$el.style.bottom = bottom;
      // 记得列表的再次刷新调用
      this.$nextTick(() => {
        this.$refs.scroll.refresh();
      });
    }
  },
  watch: {
    // 和传入数据相关的，大多在watch而非初始化created的时候计算
    data: function() {
      setTimeout(() => {
        this.calHeight();
      }, 20);
    },
    scrollY: function(newY) {
      if (!this.heights) {
        return;
      }
      // console.log(newY);
      // 滑动到最顶部（类似于下拉刷新的时候，y值大于0）
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 根据scrollY计算currentIndex
      // 在中间部分滚动
      for (let i = 0, len = this.heights.length; i < len; i++) {
        // 滑动坐标y总是负值
        if (-newY >= this.heights[i] && -newY < this.heights[i + 1]) {
          this.currentIndex = i;
          // console.log('currentINdex', this.currentIndex);
          // 计算距离当前顶部第一个分区的底部距离fixTitle顶部的距离
          this.diff = this.heights[i + 1] + newY;
          return;
        }
      }
      // 当滚动到最底部，并且-newY大于最后一个元素的上线，类似于上拉刷新的时候
      this.currentIndex = this.heights.length - 2;
    },
    diff: function(newDiff) {
      // 形成固定标题向上推的动画效果
      let fixedTop = (newDiff > 0 && newDiff < TITLE_HEIGHT) ? newDiff - TITLE_HEIGHT : 0;
      this.$refs.fixedTitle.style.transform = 'translate3d(0,' + fixedTop + 'px,0)';
    }
  }
}
</script>

<style lang="scss">
@import '../common/scss/variable.scss';
.listview {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    .fixed-title,
    .list-group-title {
        height: 30px;
        line-height: 30px;
        background-color: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;
        padding: 0 20px;
    }
    .fixed-title {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }
    .list-group-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 50px;
        line-height: 50px;
        padding: 0 20px;
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
        .name {
            color: $color-text-d;
            font-size: $font-size-medium;
            margin-left: 20px;
        }
    }
    .loading-wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .shortcut-list {
        position: absolute;
        top: 50%;
        right: 3px;
        transform: translate(-50%,-50%);
        .shortcut-item {
            font-size: $font-size-small-s;
            height: 18px;
            line-height: 18px;
            &.active {
                color: $color-theme;
            }
        }
    }
}
</style>
