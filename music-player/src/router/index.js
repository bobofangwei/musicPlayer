import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
const Recommend = (resolve) => require(['@/components/recommend/recommend.vue'], resolve)
const Rank = (resolve) => require(['@/components/rank/rank.vue'], resolve)
const RankDetail = (resolve) => require(['@/components/RankDetail/RankDetail.vue'], resolve)
const Search = (resolve) => require(['@/components/search/search.vue'], resolve)
const Singer = (resolve) => require(['@/components/singer/singer.vue'], resolve)
const Disc = (resolve) => require(['@/components/disc/disc.vue'], resolve)
const SingerDetail = (resolve) => require(['@/components/singerDetail/singerDetail.vue'], resolve)
export default new Router({
  routes: [{
      path: '/',
      redirect: '/recommend',
      name: 'root'
    },
    {
      name: 'rank',
      component: Rank,
      path: '/rank',
      children: [{
        path: ':id',
        component: RankDetail
      }]
    }, {
      name: 'search',
      component: Search,
      path: '/search'
    }, {
      name: 'singer',
      component: Singer,
      path: '/singer',
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    }, {
      name: 'recommend',
      component: Recommend,
      path: '/recommend',
      children: [{
        path: ':id',
        component: Disc
      }]
    }
  ]
})
