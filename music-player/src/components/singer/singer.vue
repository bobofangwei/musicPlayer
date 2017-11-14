<template lang="html">
  <div class="singer">
    <listview :data="singers" ref="scroll"></listview>
  </div>
</template>

<script>
import {
  getSingerList
} from '@/api/singer.js';
import listview from '@/base/Listview.vue';
const HOT_TITLE = '热门';
const HOT_LENGTH = 10;
export default {
  data: function() {
    return {
      singers: []
    };
  },
  created: function() {
    this.getSingerList();
  },
  components: {
    listview
  },
  methods: {
    getSingerList: function() {
      getSingerList().then((res) => {
        if (res.code === 0) {
          this.singers = this._normalizeSingerData(res.data.list);
          // this.$nextTick(() => {
          //   this.$refs.scroll.refresh();
          // });
        }
      });
    },
    _normalizeSingerData: function(list) {
      // 处理歌手数据
      let map = {
        hot: {
          title: HOT_TITLE,
          items: []
        }
      };
      list.forEach((singerItem, index) => {
        if (index < HOT_LENGTH) {
          map.hot.items.push({
            id: singerItem.Fsinger_id,
            name: singerItem.Fsinger_name,
            avatar: 'https://y.gtimg.cn/music/photo_new/T001R150x150M000' + singerItem.Fsinger_mid + '.jpg?max_age=2592000'
          });
        }
        // 按照首字母进行分组
        if (!(singerItem.Findex in map)) {
          map[singerItem.Findex] = {
            title: singerItem.Findex,
            items: []
          };
        }
        map[singerItem.Findex].items.push({
          id: singerItem.Fsinger_id,
          name: singerItem.Fsinger_name,
          avatar: 'https://y.gtimg.cn/music/photo_new/T001R150x150M000' + singerItem.Fsinger_mid + '.jpg?max_age=2592000'
        });
      });

      // 处理使之有序
      let ret = [];
      let hot = [];
      for (let key in map) {
        if (key.trim().match(/^[a-zA-Z]$/)) {
          ret.push(map[key]);
        } else if (key === 'hot') {
          hot.push(map[key]);
        }
      }
      ret = ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      return hot.concat(ret);
    }
  }
}
</script>

<style lang="css">
</style>
