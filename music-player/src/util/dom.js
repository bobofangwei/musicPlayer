// 该文件为dom操作的常用代码
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  el.className = el.className + ' ' + className;
};
export function hasClass(el, className) {
  let initClassName = el.className;
  return (' ' + initClassName + ' ').indexOf(' ' + className + ' ') > 0;
};
let elStyle = document.createElement('div').style;
let vender = (() => {
  const transformPrefixes = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  };
  for (let key in transformPrefixes) {
    if (elStyle[transformPrefixes[key]] !== undefined) {
      return key;
    }
  }
  return false;
})();
// 为样式添加浏览器前缀，并不限于transform
export function prefix(style) {
  if (vender === false) {
    return false;
  }
  if (vender === 'standard') {
    return style;
  }
  return vender + style.charAt(0).toUpperCase() + style.slice(1);
};
