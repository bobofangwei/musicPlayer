// import axios from '@/util/axios.js';
import {
  commonConfig
} from './config.js';
import jsonp from '@/util/jsonp.js';
// 排行榜相关接口
export function getTopList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_opt.fcg';
  const params = {
    page: 'index',
    format: 'html',
    tpl: 'macv4',
    v8debug: 1,
    jsonpCallback: 'jsonCallback'
  };
  return jsonp(url, params, {
    name: 'jsonCallback'
  });
};
// 获取某个排行榜下的详情
// 该接口使用单纯的jsonp方法请求不到，应该是qq做了限制
// 需要后台服务器加以处理
export function getTopDetail(topid, topDate) {
  const url = '/api/getRankDetail';
  const params = Object.assign({}, commonConfig, {
    tpl: 3,
    page: 'detail',
    date: topDate,
    topid: topid,
    type: 'top',
    song_begin: 0,
    song_num: 30,
    jsonpCallback: 'MusicJsonCallbacktoplist'
  });
  return jsonp(url, params, {
    name: 'MusicJsonCallbacktoplist'
  });
};
