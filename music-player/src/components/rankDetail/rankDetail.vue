<template lang="html">
<transition name="slide">
  <music-list :title="rank.ListName" :bgImage="songs[0]&&songs[0].image" :songs="songs" v-if="songs" :rank="true"></music-list>
</transition>
</template>

<script>
import {
  getTopDetail
} from '@/api/rank.js';
import {
  mapState
} from 'vuex';
import Song from '@/model/song.js';
import musicList from '@/components/musicList/musicList.vue';

export default {
  data() {
    return {
      songs: []
    };
  },
  components: {
    musicList
  },
  created() {
    console.log('this.rank', this.rank);
    this.getRankDetail();
  },
  computed: {
    ...mapState([
      'rank'
    ])
  },
  methods: {
    getRankDetail() {
      // 在当前页面刷新，返回上一个导航
      if (!this.rank) {
        this.$router.go(-1);
      }
      if (!this.rank.topID || !this.rank.showtime) {
        return;
      }
      getTopDetail(this.rank.topID, this.rank.showtime).then((res) => {
        console.log('getTopDetail', res);
        this.songs = this._normalsizeSongData(res.songlist);
      });
    },
    _normalsizeSongData(list) {
      let ret = [];
      list.forEach((item, index) => {
        let curSong = Object.create(Song);
        curSong.initWidthMusicData(item.data);
        ret.push(curSong);
      });
      return ret;
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.4s linear;
}
.slide-enter,
.slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>
