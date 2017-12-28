import {
  parseLyric
} from '@/util/util.js';
import {
  getLyric
} from '@/api/song.js';

var Song = {
  init: function(id, mid, singer, name, album, duration, image, url) {
    this.id = id;
    this.mid = mid;
    this.singer = singer; // 数组类型
    this.name = name;
    this.album = album;
    this.duration = duration;
    this.image = image;
    this.url = url;
  },
  initWidthMusicData: function(musicData) {
    // 歌曲图片，歌曲的多媒体地址，以及歌手列表需要进一步的处理
    let image = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + musicData.albummid + '.jpg?max_age=2592000';
    let url = `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`;
    let singers = musicData.singer.map((item) => {
      return item.name;
    });
    this.init(musicData.songid, musicData.songmid, singers.join(','), musicData.songname, musicData.albumname, musicData.interval, image, url);
  },
  getSongLyric: function() {
    if (!this.id) {
      return;
    }
    return getLyric(this.id).then((res) => {
      if (res.retcode === 0) {
        return parseLyric(res.lyric);
      } else {
        return 'no lyric';
      }
    });
  }
};
export default Song;
