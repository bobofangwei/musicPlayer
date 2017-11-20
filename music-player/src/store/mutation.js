import * as types from './mutation_types';
export default {
  [types.SET_DISLIST](state, disList) {
    state.disList = disList;
  },
  [types.SET_SINGER](state, singer) {
    state.singer = singer;
  }
};
