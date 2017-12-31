import {
  PLAYMODE
} from '@/common/js/config.js';
const state = {
  singer: {}, // 当前歌手
  playing: false, // 播放器状态
  fullScreen: false, // 播放器全屏还是缩放
  playList: [], // 播放列表,支持多种播放模式
  sequenceList: [], // 顺序播放模式,当顺序播放时，和playList取值相同
  mode: PLAYMODE.SEQUENCE,
  currentIndex: -1, // 当前播放歌曲的索引
  diss: {} // 当前歌单
};
export default state;
