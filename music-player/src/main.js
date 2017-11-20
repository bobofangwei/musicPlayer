import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store';
import fastclick from 'fastclick'
import '@/common/scss/index.scss'
import VueLazyload from 'vue-lazyload';
Vue.config.productionTip = false
// 解决移动端点击300ms的延时问题,使用这个库之后，点击将没有延时
fastclick.attach(document.body)
/* eslint-disable no-new */
// 这里尝试过直接为loading赋值字符串./common/image/default.png
// 但经过测试发现不可行，貌似dist目录下的可以?
Vue.use(VueLazyload, {
  loading: require('./common/image/default.png'),
  attempt: 1,
  preload: 1
});
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
