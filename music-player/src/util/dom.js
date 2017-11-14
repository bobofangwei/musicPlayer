// 该文件为dom操作的常用代码
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  el.className = el.className + ' ' + className;
}
export function hasClass(el, className) {
  let initClassName = el.className;
  return (' ' + initClassName + ' ').indexOf(' ' + className + ' ') > 0;
}
