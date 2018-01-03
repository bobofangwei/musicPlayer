<template lang="html">
  <div class="songlist-wrapper">
    <ul class="music-list">
      <li class="music-item" v-for="(song,index) in songs" @click="handleClick(song,index)">
        <div class="music-rank" v-if="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="music-content">
          <div class="music-title">{{song.name}}</div>
          <div class="music-text">{{song.singer}}-{{song.album}}</div>
        </div>
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
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(song, index) {
      this.$emit('selectSong', song, index);
    },
    getRankCls(index) {
      return index <= 2 ? 'icon icon' + index : 'text';
    },
    getRankText(index) {
      return index > 2 ? index : '';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
@import '../../common/scss/mixin.scss';
.music-list {
    padding: 20px 0;
    .music-item {
        padding: 10px 20px 10px 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        .music-rank {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 50px;
            height: 30px;
            .icon {
                width: 25px;
                height: 24px;
                display: inline-block;
                background-size: 100% 100%;
                &.icon0 {
                    @include bg-image("./first");
                }
                &.icon1 {
                    @include bg-image("./second");
                }
                &.icon2 {
                    @include bg-image("./third");
                }
            }
            .text {
                font-size: $font-size-medium-x;
                color: $color-theme;
            }
        }
        .music-content {
            flex: 1;
            .music-title {
                font-size: $font-size-medium;
                color: #FFF;
            }
            .music-text {
                color: $color-text-l;
                margin-top: 10px;
                font-size: $font-size-small;
            }
        }
    }
}
</style>
