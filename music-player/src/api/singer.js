// 获取歌手列表
// import axios from '@/util/axios.js';
import {
  commonConfig
} from './config.js';
import jsonp from '@/util/jsonp.js';
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
