import Vuex from 'vuex';
import state from './state.js';
import actions from './action.js';
import mutations from './mutation.js';

const store=new Vuex.store({
  state,
  actions,
  mutations
});
