import originJSONP from 'jsonp';

// 封装成promise的形式
export default function jsonp(url, paramObject, option) {
  url += (url.endsWith('?') ? '' : '?') + param(paramObject);
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function param(data) {
  let ret = '';
  for (let key in data) {
    let value = data[key] !== undefined ? data[key] : '';
    ret += `&${key}=${encodeURIComponent(value)}`;
  }
  return ret ? ret.substring(1) : '';
}
