<template lang="html">
<transition name="slide">
  <music-list :title="title" :songs="songs" :bg-image="bgImage" v-if="songs.length"></music-list>
</transition>
</template>

<script>
import {
  mapState
} from 'vuex';
import {
  getSingerDetail
} from '@/api/singer.js';
import Song from '@/model/song.js';
import musicList from '@/components/musicList/musicList.vue';
export default {
  data: function() {
    return {
      songs: []
    };
  },
  components: {
    musicList
  },
  created: function() {
    this.getSingerSongs(this.singer.id);
  },
  methods: {
    getSingerSongs: function() {
      if (!this.singer.id) {
        this.$router.push({
          path: '/singer'
        });
      };
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code !== 0) {
          return;
        }
        this.songs = this._normalsizeSongData(res.data.list);
        // console.log(this.songs);
      })
    },
    _normalsizeSongData: function(list) {
      let ret = [];
      list.forEach((item, index) => {
        let curSong = Object.create(Song);
        curSong.initWidthMusicData(item.musicData);
        ret.push(curSong);
      });
      return ret;
    }
  },
  computed: {
    ...mapState(['singer']),
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    }
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
