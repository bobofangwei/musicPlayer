// 获取歌手列表
// import axios from '@/util/axios.js';
import {
  commonConfig
} from './config.js';
import jsonp from '@/util/jsonp.js';
// 该接口，貌似qq音乐并没有进行头部的限制
export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg';
  const params = Object.assign({}, commonConfig, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    jsonpCallback: 'GetSingerListCallback',
    pagesize: 100,
    pagenum: 1
  });
  return jsonp(url, params, {
    name: 'GetSingerListCallback'
  });
};
// 根据歌手id获取歌手专辑，歌曲信息
export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg';
  const params = Object.assign({}, commonConfig, {
    jsonpCallback: 'MusicJsonCallbacksinger_track',
    singermid: singerId,
    order: 'listen',
    begin: 0,
    num: 30,
    songstatus: 1
  });
  return jsonp(url, params, {
    name: 'MusicJsonCallbacksinger_track'
  });
};
