import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
/* 按需引入 */
import './plugins/element.js'
/* 导入字体图标 */
import './assets/fonts/iconfont.css'
/* 导入富文本编辑器 */
import VueQuillEditor from 'vue-quill-editor'
/* 导入富文本编辑器的样式 */
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
/* 导入axios */
import axios from 'axios'
/* 导入table树新结构的第三方控件 */
import TreeTable from 'vue-table-with-tree-grid'
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
/* 将富文本编辑器注册为全局可用的组件 */
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)
/* 定义处理时间格式的过滤器 */
Vue.filter('dateFormat', function(originValue) {
  const dt = new Date(originValue)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padEnd(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
