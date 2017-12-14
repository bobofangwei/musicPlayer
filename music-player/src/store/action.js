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
    // 当点击了随机播放全部，再挑选歌曲的话，state.mode是随机模式
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
  },
  // 随机播放全部功能实现
  randomPlayAll({
    state,
    commit
  }, list) {
    commit(types.SET_FULLSCREEN, true);
    commit(types.SET_PLAYMODE, PLAYMODE.RANDOM);
    commit(types.SET_CURRENTINDEX, 0);
    commit(types.SET_SEQUENCELIST, list);
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    commit(types.SET_PLAYING, true);
  }
};
export default actions;
