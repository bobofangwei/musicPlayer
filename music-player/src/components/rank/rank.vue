<template lang="html">
  <div class="rank" ref="rank">
    <scroll :data="rankList" class="scroll" ref="scroll">
      <ul class="rank-list">
        <li class="rank-item" v-for="(item,index) in rankList" @click="selectItem(item)">
          <div class="img-wrapper">
            <img v-lazy="item.pic" alt="">
          </div>
          <div class="content-wrapper">
            <ul class="song-list">
              <li class="song-item" v-for="(song,index) in item.songlist">
                {{(index+1)+song.songname}}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import {
  getTopList
} from '@/api/rank.js';
import scroll from '@/base/scroll.vue';
import miniPlayerMixin from '@/base/mixin/miniPlayerMixin.js';
import {
  mapMutations
} from 'vuex';
const MINIPLAYER_HEIGHT = '60px';
export default {
  mixins: [miniPlayerMixin],
  data() {
    return {
      rankList: []
    }
  },
  components: {
    scroll
  },
  created() {
    this.getRankList();
  },
  methods: {
    getRankList() {
      getTopList().then(res => {
        this.rankList = res[0].List;
      });
    },
    selectItem(item) {
      console.log('当前排行', item);
      this.setRank(item);
      this.$router.push({
        path: `/rank/${item.topID}`
      });
    },
    handleMiniPlayer(playList) {
      // console.log('musicList,handleMiniPlayer', this.playList.length > 0);
      const bottom = playList && playList.length > 0 ? MINIPLAYER_HEIGHT : '0';
      // this.$refs.scroll.$el.style.bottom = bottom;
      this.$refs.rank.style.bottom = bottom;
      // 记得列表的再次刷新调用
      this.$nextTick(() => {
        this.$refs.scroll.refresh();
      });
    },
    ...mapMutations({
      'setRank': 'SET_RANK'
    })
  }
}
</script>

<style lang="scss">
@import "../../common/scss/variable.scss";
.rank {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    .scroll {
        width: 100%;
        height: 100%;
    }
    .rank-item {
        padding: 8px 15px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        .img-wrapper {
            width: 80px;
            height: 80px;
            img {
                width: 100%;
                height: 100%;
            }
        }
        .content-wrapper {
            flex: 1;
            padding: 6px 15px;
            background-color: $color-highlight-background;
            font-size: $font-size-small;
            color: $color-text-l;
            .song-list {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
            }
        }
    }
}
</style>
