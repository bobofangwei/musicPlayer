import axios from '@/util/axios.js';
import {
  commonConfig
} from './config.js';
import jsonp from '@/util/jsonp.js';
export function getRecommend() {
  const url = '/api/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  let params = {
    g_tk: 5381,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    _: '1508740282027'
  };
  // const url = 'https://c.y.qq.com//musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
  return axios.get(url, {
    'params': params
  });
};
// 获取首页歌单列表数据
export function getDiscList() {
  const url = '/api/getDiscList';
  // ?jsonpCallback=MusicJsonCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0";
  const data = {
    picmid: 1,
    rnd: Math.random(),
    jsonpCallback: 'getPlaylist',
    categoryId: '10000000',
    sortId: 5,
    sin: 0,
    ein: 29
  };
  let params = Object.assign({}, commonConfig, data);
  // 这个请求本来是个jsonp
  // 不过对头部有一些特殊的要求，因此服务器端进行了处理
  return jsonp(url, params, {
    name: 'getPlaylist'
  });
};
// 获取歌单详情数据，即该歌单下的歌曲列表
export function getDissDetail(disstid) {
  const url = '/api/getDissDetail';
  const param = Object.assign({}, commonConfig, {
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    disstid: disstid,
    jsonpCallback: 'playlistinfoCallback'
  });
  return jsonp(url, param, {
    name: 'playlistinfoCallback'
  });
}
