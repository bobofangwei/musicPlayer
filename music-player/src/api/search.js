import {
  commonConfig
} from './config.js';
// import jsonp from '@/util/jsonp.js';
import axios from '@/util/axios.js';
// 获取热门搜索关键词
export function getHotQuery() {
  const url = '/api/splcloud/fcgi-bin/gethotkey.fcg';
  const params = {
    g_tk: 5381,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1,
    _: '1515293877690'
  };
  return axios.get(url, params);
}

// 根据搜索关键词搜索结果
export function searchQuery(queryWord, pageIndex, pageNum) {
  const url = '/api/soso/fcgi-bin/search_for_qq_cp';
  // const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp';
  const params = Object.assign({}, commonConfig, {
    uin: 0,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    w: queryWord,
    zhidaqu: 1,
    catZhida: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: pageNum,
    n: pageNum,
    p: pageIndex,
    remoteplace: 'txt.mqq.all',
    _: '1515394302660'
  });
  // return axios.get(url, params);
  // 搞不懂这里为什么，使用上面的axios。get就是不行
  return axios.request({
    url: url,
    method: 'GET',
    params: params
  });
}
