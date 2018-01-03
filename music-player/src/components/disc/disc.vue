<template lang="html">
<transition name="slide">
  <music-list :title="title" :songs="songs" :bg-image="bgImage" v-if="songs && songs.length"></music-list>
</transition>
</template>

<script>
import {
  mapState
} from 'vuex';
import {
  getDissDetail
} from '@/api/recommend.js';
import Song from '@/model/song.js';
import musicList from '@/components/musicList/musicList.vue';
export default {
  data() {
    return {
      songs: []
    };
  },
  created: function() {
    this.getDissSongs();
  },
  methods: {
    getDissSongs: function() {
      if (!this.diss.dissid) {
        // 返回歌手列表页面
        this.$router.push({
          path: '/recommend'
        });
      };
      getDissDetail(this.diss.dissid).then((res) => {
        if (res.code !== 0) {
          return;
        }
        this.songs = this._normalsizeSongData(res.cdlist[0].songlist);
        // console.log(this.songs);
      })
    },
    _normalsizeSongData: function(list) {
      let ret = [];
      list.forEach((item, index) => {
        let curSong = Object.create(Song);
        curSong.initWidthMusicData(item);
        ret.push(curSong);
      });
      return ret;
    }
  },
  computed: {
    ...mapState(['diss']),
    title() {
      return this.diss.dissname;
    },
    bgImage() {
      return this.diss.imgurl;
    }
  },
  components: {
    musicList
  }
}
</script>

<style lang="scss" scoped>
.slide-enter,
.slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
.slide-enter-to,
.slide-leave {
    transition: all 0.3s;
}
</style>
