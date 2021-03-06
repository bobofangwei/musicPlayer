'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const opn = require('opn')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(webpackConfig)

/*my own Code*/
var apiRouter = express.Router();
var axios = require('axios');

// const urls=[];
// 获取歌单列表的接口
apiRouter.get('/getDiscList', (req, res) => {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';
  // console.log('req.headers', req.headers);
  // console.log('req.query', req.query);
  return axios.get(url, {
    headers: {
      'authority': 'c.y.qq.com',
      'referer': 'https://y.qq.com/portal/playlist.html'
    },
    params: req.query
  }).then((resData) => {
    res.end(resData.data);
  }).catch((err) => {
    console.log(err);
  });
});
// 获取歌词的接口
apiRouter.get('/getLyric', (req, res) => {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg';
  // console.log('req.headers', req.headers);
  // console.log('req.query', req.query);
  return axios.get(url, {
    headers: {
      'authority': 'c.y.qq.com',
      'referer': 'https://y.qq.com/n/yqq/song/001Qu4I30eVFYb.html'
    },
    params: req.query
  }).then((resData) => {
    res.end(resData.data);
  }).catch((err) => {
    res.end(err);
  });
});
// 获取歌单详情的接口
apiRouter.get('/getDissDetail', (req, res) => {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg';
  // console.log('req.headers', req.headers);
  // console.log('req.query', req.query);
  return axios.get(url, {
    headers: {
      'authority': 'c.y.qq.com',
      'referer': 'https://y.qq.com/n/yqq/playlist/' + req.query.dissid + '.html'
    },
    params: req.query
  }).then((resData) => {
    res.end(resData.data);
  }).catch((err) => {
    res.end(err);
  });
});
// 获取排行详情的处理
apiRouter.get('/getRankDetail', (req, res) => {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg';
  // console.log('req.headers', req.headers);
  // console.log('req.query', req.query);
  return axios.get(url, {
    headers: {
      'authority': 'c.y.qq.com',
      'referer': 'https://y.qq.com/n/yqq/toplist/' + req.query.topid + '.html'
    },
    params: req.query
  }).then((resData) => {
    res.end(resData.data);
  }).catch((err) => {
    res.end(err);
  });
});
// // 其他接口的处理
apiRouter.get('*', (req, response) => {
  // console.log(req);
  // console.log(req.url);
  // let url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1508740282027';
  let url = 'https://c.y.qq.com' + req.url;
  return axios.get(url).then((res) => {
    // console.log(JSON.stringify(resData.data));
    response.json(res.data);
  });
});
app.use('/api', apiRouter);
/*my own Code End*/

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
// currently disabled until this is resolved:
// https://github.com/jantimon/html-webpack-plugin/issues/680
// compiler.plugin('compilation', function (compilation) {
//   compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//     cb()
//   })
// })

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = {
      target: options
    }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

const uri = 'http://10.3.135.206:' + port

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

var server
var portfinder = require('portfinder')
portfinder.basePort = port

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://10.3.135.206:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
