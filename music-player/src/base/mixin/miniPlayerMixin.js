// 实现迷你播放器播放时的，屏幕底部的自适应
import {
  mapState
} from 'vuex';
let miniPlayerMixin = {
  computed: {
    ...mapState(['playList'])
  },
  mounted() {
    this.handleMiniPlayer(this.playList);
  },
  // 在keepAlive组件每次激活的时候使用
  actived() {
    this.handleMiniPlayer(this.playList);
  },
  watch: {
    playList(newVal) {
      this.handleMiniPlayer(newVal);
    }
  },
  methods: {
    handleMiniPlayer() {
      throw new Error('component must implement handleMiniPlayer method');
    }
  }
};
export default miniPlayerMixin;
