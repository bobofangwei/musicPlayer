export function shuffle(arr) {
  // 注意arr.sort是原地更改，因此必须创建一个副本
  let _arr = arr.slice();
  return _arr.sort((a, b) => {
    return Math.random() - 0.5;
  });
};
export function findSongIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id;
  });
};
// 不足的话，在前面补齐
// num为补齐之后的位数
// char为用来补齐的字符
export function paddingStart(str, num, char) {
  return (char.repeat(num) + str).slice(-num);
};
// 解析歌词文件，主要是解析其中的html特殊字符
// &#58;——>:
// &#46;——>.
// &#10;——>换行
export function parseLyric(lyricStr) {
  return lyricStr.replace(/&#58;/g, ':').replace(/&#46;/g, '.').replace(/&#10;/g, '\r\n').replace(/&#32;/g, ' ').replace(/&#45;/g, '-');
}
