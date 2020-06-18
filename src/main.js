import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
/* 按需引入 */
import './plugins/element.js'
/* 导入字体图标 */
import './assets/fonts/iconfont.css'

import axios from 'axios'
/* 配置请求的根路径 */
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
/* 配置axios的请求拦截 */
axios.interceptors.request.use(config => {
  /* 为每次请求添加token验证的Authorization字段 后端会对这个字段进行验证确保登陆状态 */
  config.headers.Authorization = window.sessionStorage.getItem('token')
  /* 必须 return config */
  return config
})
/* 在vue实例上挂载http (用来发请求方法) */
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
