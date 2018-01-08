<template lang="html">
  <div class="search">
    <div class="searchbox-wrapper">
      <search-box v-model="query" @queryChange="queryChangeHandler"></search-box>
    </div>
    <!--页面剩余部分，包含热门搜索，搜索历史-->
    <div class="rest-wrapper">
      <div class="hot-search">
        <h2 class="hot-search-title">热门搜索</h2>
        <ul class="hot-search-list">
          <li class="hot-search-item" v-for="item in hotQuerys" @click="selectHotQuery(item)">
            {{item.k}}
          </li>
        </ul>
      </div>
      <div class="search-history"></div>
    </div>
    <!-- 显示搜索提示与搜索结果-->
    <div class="search-result-wrapper" v-show="query">
      <search-result :query="query"></search-result>
    </div>
  </div>
</template>

<script>
import searchBox from '@/components/searchBox/searchBox.vue';
import {
  getHotQuery
} from '@/api/search.js';
import searchResult from '@/components/searchResult/searchResult.vue'
export default {
  components: {
    searchBox,
    searchResult
  },
  data() {
    return {
      hotQuerys: [],
      query: null
    }
  },
  created() {
    this.getHotSearchQuerys();
  },
  methods: {
    getHotSearchQuerys() {
      getHotQuery().then((res) => {
        // debugger
        // 选择数据中的前10条作为热门搜索关键词
        if (res.data.code === 0) {
          this.hotQuerys = res.data.data.hotkey.splice(0, 10);
        }
      });
    },
    // searchBox组件触发的事件
    queryChangeHandler(newQuery) {
      this.query = newQuery;
      // console.log('queryChangeHandler');
      console.log('queryChangeHandler', this.query);
    },
    // 点击热门搜索区域的热门搜索关键词
    selectHotQuery(item) {
      this.query = item.k;
    }
  }

}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
.searchbox-wrapper {
    padding: 10px 15px;
}
.rest-wrapper {
    position: fixed;
    top: 148px;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: 15px 20px;
    .hot-search {
        .hot-search-title {
            font-size: $font-size-medium;
            color: $color-text-l;
            padding-bottom: 10px;
        }
        .hot-search-item {
            display: inline-block;
            margin: 5px;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: $font-size-small-s;
            color: $color-text-d;
            background: $color-highlight-background;
        }
    }
}
</style>
