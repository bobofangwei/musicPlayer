import * as types from './mutation_types';
import {
  getDiscList
} from '@/api/recommend.js';
export default {
  setDiscListAsync() {
    // 发送异步请求，获取歌单列表
    getDiscList().then((res) => {

    });
  }
};
