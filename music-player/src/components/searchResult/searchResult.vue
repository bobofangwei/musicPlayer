<template lang="html">
<div class="search-result">
  <scroll :data="searchResult" class="scroll" ref="scroll" @pullup="pullupHandler" :pullup="true">
    <ul class="search-result-list">
      <li class="search-result-item" v-for="item in searchResult">
        <i :class="[item.type===0?'icon-music':'icon-mine', 'icon']"></i>
        <div class="search-result-desc">{{item.type===0? item.name+'-'+item.singer:item.singername }}</div>
      </li>
    </ul>
  </scroll>
</div>
</template>

<script>
import scroll from '@/base/scroll.vue';
import {
  searchQuery
} from '@/api/search.js';
import Song from '@/model/song.js';
const TYPE_SINGER = 2; // 歌手type为2
const TYPE_SONG = 0; // 歌曲type为0
// const TYPE_ALBUM = 3; // 专辑type为3
const PAGE_NUM = 20; // 分页查询中每页返回多少数据
export default {
  props: {
    query: {
      type: String,
      default: null
    }
  },
  components: {
    scroll
  },
  data() {
    return {
      searchResult: [],
      type: TYPE_SINGER // type为0代表歌曲，否则代表歌手
    };
  },
  created() {
    this.pageIndex = 1; // 当次请求的页码
    this.totalNum = 0; // 歌曲总条数
    this.curNum = 0; // 当次请求返回的歌曲条数
  },
  methods: {
    searchForResult() {
      if (!this.query) {
        return;
      }
      // 接口返回的pageIndex从1开始编码
      searchQuery(this.query, this.pageIndex, PAGE_NUM).then((res) => {
        let resData = res.data;
        if (resData.code === 0) {
          this.pageIndex = resData.data.song.curpage;
          this.totalNum = resData.data.song.totalnum;
          this.curNum = resData.data.song.curNum;
          this.searchResult = this.searchResult.concat(this._normalizeQueryResult(resData.data));
        }
      });
    },
    // 实现下拉刷新功能
    pullupHandler() {
      if ((this.pageIndex - 1) * PAGE_NUM + this.curNum >= this.totalNum) {
        // 说明没有更多的数据可请求
        return;
      }
      this.pageIndex++;
      this.searchForResult();
    },
    _normalizeQueryResult(resData) {
      let ret = [];
      if (resData.zhida && resData.zhida.singerid) {
        ret.push({ ...resData.zhida,
          ...{
            type: TYPE_SINGER
          }
        });
      }
      ret = ret.concat(this._normalizeSongs(resData.song.list));
      return ret;
    },
    _normalizeSongs(songs) {
      let ret = [];
      songs.forEach((item) => {
        let song = Object.create(Song);
        song.initWidthMusicData(item);
        ret.push({ ...song,
          ...{
            type: TYPE_SONG
          }
        });
      });
      return ret;
    }
  },
  watch: {
    query(newQuery) {
      this.pageIndex = 1;
      this.searchResult = [];
      this.searchForResult();
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
.search-result {
    position: fixed;
    top: 148px;
    width: 100%;
    bottom: 0;
    overflow: hidden;
    background: $color-background;
    .scroll {
        height: 100%;
        width: 100%;
    }
    .search-result-item {
        display: flex;
        flex-direction: row;
        color: $color-text-l;
        justify-content: flex-start;
        padding: 10px 20px;
        font-size: $font-size-small;
        .icon {
            margin-right: 20px;
        }
    }
}
</style>
