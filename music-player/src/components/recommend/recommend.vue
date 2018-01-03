<template lang="html">
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="dic-scroll" :data="dicData">
    <div>
      <div class="slider-wrapper">
        <slider1 v-if="sliderData&&sliderData.length>0">
        <div v-for="item in sliderData">
          <a :href="item.linkUrl">
            <img :src="item.picUrl">
          </a>
        </div>
      </slider1>
      </div>
      <div class="dic-title">热门歌单推荐</div>
      <ul class="dic-list">
        <li class="dic-item" v-for="item in dicData" @click="selectDiss(item)">
          <div class="dic-icon">
            <img v-lazy="item.imgurl" alt="">
          </div>
          <div class="dic-text">
            <div class="name" v-html="item.creator.name"></div>
            <div class="desc" v-html="item.dissname"></div>
          </div>
        </li>
      </ul>
  </div>
    </scroll>
    <div class="loadding-wrapper" v-show="!dicData.length">
      <loading></loading>
    </div>
    <router-view></router-view>
  </div>

</template>

<script>
import {
  getRecommend,
  getDiscList
} from '@/api/recommend.js';
import {
  mapMutations
} from 'vuex';
import loading from '@/base/loading/loading.vue';
import scroll from '@/base/scroll.vue';
import slider1 from '@/base/slider1.vue';
import miniPlayerMixin from '@/base/mixin/miniPlayerMixin';
const MINIPLAYER_HEIGHT = '60px'; // 底部迷你播放器的高度
export default {
  mixins: [miniPlayerMixin],
  data: function() {
    return {
      sliderData: [],
      dicData: []
    };
  },
  created: function() {
    getRecommend().then((res) => {
      this.sliderData = res.data.data.slider;
      // console.log(this.sliderData);
    });
    // 获取歌单从qq音乐的所有歌单接口获取，方式是jsonp
    getDiscList().then((res) => {
      this.dicData = res.data.list;
      // 赋值之后scroll组件的data即发生变化，会在watch中调用refresh，按理说这里无需再次调用
      // this.$nextTick(function() {
      //   console.log('prarent refresh');
      //   this.$refs.scroll.refresh();
      // });
      // console.log('res', res.data);
    });
  },
  // activated: function() {
  //   console.log('recommend.vue activated');
  //   this.$nextTick(() => {
  //     this.$refs.scroll.refresh();
  //   });
  // },
  methods: {
    selectDiss(item) {
      this.setDiss(item);
      console.log('当前歌单：', this.$store.state.diss);
      this.$router.push({
        path: `/recommend/${item.dissid}`
      });
    },
    handleMiniPlayer(playList) {
      // console.log('musicList,handleMiniPlayer', this.playList.length > 0);
      const bottom = playList && playList.length > 0 ? MINIPLAYER_HEIGHT : '0';
      // this.$refs.scroll.$el.style.bottom = bottom;
      this.$refs.recommend.style.bottom = bottom;
      // 记得列表的再次刷新调用
      this.$nextTick(() => {
        this.$refs.scroll.refresh();
      });
    },
    ...mapMutations({
      'setDiss': 'SET_DISS'
    })
  },
  components: {
    loading,
    scroll,
    slider1
  }
}
</script>

<style lang="scss">
@import '../../common/scss/variable.scss';
.recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .dic-scroll {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        overflow: hidden;
    }
    .dic-title {
        text-align: center;
        color: $color-theme;
        font-size: $font-size-medium;
        height: 40px;
        line-height: 40px;
    }
    .dic-list {
        margin-top: -15px;
    }
    .dic-item {
        display: flex;
        margin: 15px;
        .dic-icon {
            width: 60px;
            height: 60px;
            flex: 0 1 auto;
            img {
                width: 100%;
                height: 100%;
            }
        }
        .dic-text {
            flex: 1;
            font-size: $font-size-small;
            margin-left: 15px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .name {
                margin-bottom: 15px;
            }
            .desc {
                color: $color-text-d;
            }
        }
    }
    .loadding-wrapper {
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
