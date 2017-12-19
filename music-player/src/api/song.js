import jsonp from '@/util/jsonp.js';
import {
  commonConfig
} from './config.js';

// 获取歌曲的歌单数据
export function getLyric(songMid) {
  const url = '/api/getLyric';
  const params = {
    nobase64: 1,
    musicid: songMid,
    jsonpCallback: 'jsonp1'
  };
  return jsonp(url, Object.assign({}, commonConfig, params), {
    name: 'jsonp1'
  });
};
