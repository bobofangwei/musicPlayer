<template lang="html">
  <div class="recommend">
  <scroll ref="scroll" class="dic-scroll" :data="dicData">
    <div>
      <div class="slider-wrapper" v-if="sliderData.length">
        <slider>
        <div v-for="item in sliderData">
          <a :href="item.linkUrl">
            <img :src="item.picUrl">
          </a>
        </div>
        </slider>
      </div>
      <div class="dic-title">热门歌单推荐</div>
      <ul class="dic-list">
        <li class="dic-item" v-for="item in dicData">
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
  </div>
</template>

<script>
import {
  getRecommend,
  getDiscList
} from '@/api/recommend.js';
import slider from '@/base/slider.vue';
import loading from '@/base/loading/loading.vue';
import scroll from '@/base/scroll.vue';
export default {
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
      this.$nextTick(function() {
        this.$refs.scroll.refresh();
      });
      // console.log('res', res.data);
    });
  },
  methods: {},
  components: {
    slider,
    loading,
    scroll
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
        height: 100%;
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
