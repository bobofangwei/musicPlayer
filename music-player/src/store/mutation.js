import * as types from './mutation_types';
export default {
  [types.SET_SINGER](state, singer) {
    state.singer = singer;
  },
  [types.SET_DISS](state, diss) {
    state.diss = diss;
  },
  [types.SET_PLAYING](state, playing) {
    state.playing = playing;
  },
  [types.SET_PLAYLIST](state, playList) {
    state.playList = playList;
  },
  [types.SET_SEQUENCELIST](state, sequenceList) {
    state.sequenceList = sequenceList;
  },
  [types.SET_PLAYMODE](state, mode) {
    state.mode = mode;
  },
  [types.SET_CURRENTINDEX](state, currentIndex) {
    state.currentIndex = currentIndex;
  },
  [types.SET_FULLSCREEN](state, fullScreen) {
    state.fullScreen = fullScreen;
  },
  [types.SET_RANK](state, rank) {
    state.rank = rank;
  }
};
