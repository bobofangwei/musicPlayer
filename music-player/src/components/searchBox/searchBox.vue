<template lang="html">
  <div class="search-box">
    <i class="icon-search"></i>
    <input type="text" class="input" :placeholder="placeholder" v-bind:value="curValue" v-on:change="handleChange" >
    <i class="icon-dismiss" @click="clear" v-show="curValue"></i>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: '请搜索歌手、歌曲'
    }
  },
  data() {
    return {
      curValue: this.value
    }
  },
  watch: {
    value(newVal) {
      this.curValue = newVal;
    },
    curValue(newCurValue) {
      this.$emit('queryChange', newCurValue);
    }
  },
  methods: {
    // input有两种事件
    // input在value改变的时候实时触发
    // change在失去焦点的时候才触发
    handleChange(e) {
      let nowVal = e.target.value.trim();
      this.curValue = nowVal;
    },
    // 清空输入框
    clear() {
      this.curValue = '';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/variable.scss';
.search-box {
  display: flex;
  height: 40px;
  width: 100%;
  line-height: 40px;
  align-items: center;
  background: $color-highlight-background;
  border-radius: 6px;
  padding: 0 6px;
  box-sizing: border-box;
  .icon-search {
    font-size: 24px;
    color: $color-background;
    margin-right: 6px;
  }
  .input {
    flex: 1;
    background: $color-highlight-background;
    font-size: $font-size-medium;
    height: 24px;
    line-height: 24px;
    color: $color-text;
    padding: 0 5px;
    &::placeholder {
      color: $color-text-d;
    }
  }
  .icon-dismiss {
    color: $color-background;
    font-size:18px;
  }
}
</style>
