import * as types from './mutation_types.js';
import {
  PLAYMODE
} from '../common/js/config.js';
import {
  shuffle,
  findSongIndex
} from '../util/util.js';

// 1.设置播放器的playList为当前歌手的歌曲列表，即songs
// 2.设置播放器的currentIndex
// 3.设置播放器的fullScreen,以及playing状态
// 更改vuex中的状态需要用到mutations
const actions = {
  selectSong: function({
    state,
    commit
  }, {
    list,
    index
  }) {
    commit(types.SET_SEQUENCELIST, list);
    if (state.mode === PLAYMODE.RANDOM) {
      // 将list随机排列
      let randomList = shuffle(list);
      commit(types.SET_PLAYLIST, randomList);
      index = findSongIndex(list, list[index]);
    } else {
      // 说明是顺序播放模式
      commit(types.SET_PLAYLIST, list);
    }
    commit(types.SET_FULLSCREEN, true);
    commit(types.SET_PLAYING, true);
    commit(types.SET_CURRENTINDEX, index);
  }
};
export default actions;
