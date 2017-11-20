import Vue from 'vue';
import Vuex from 'vuex';
import state from './state.js';
import actions from './action.js';
import mutations from './mutation.js';
Vue.use(Vuex);
const store = new Vuex.Store({
  state,
  actions,
  mutations
});
export default store;
