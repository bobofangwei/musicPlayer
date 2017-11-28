<template lang="html">
  <div class="songlist-wrapper">
    <ul class="music-list">
      <li class="music-item" v-for="(song,index) in songs" @click="handleClick(song,index)">
        <div class="music-title">{{song.name}}</div>
        <div class="music-content">{{song.singer}}-{{song.album}}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  methods: {
    handleClick(song, index) {
      this.$emit('selectSong', song, index);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../common/scss/variable.scss';
.music-list {
    padding: 20px 0;
    .music-item {
        padding: 10px 20px;
        .music-title {
            font-size: $font-size-medium;
            color: #FFF;
        }
        .music-content {
            color: $color-text-l;
            margin-top: 10px;
            font-size: $font-size-small;
        }
    }
}
</style>
