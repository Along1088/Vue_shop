import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'

/* 解决路由相同路径跳转报错的问题 */
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: './login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles }
    ]
  }
]
const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  /* 1.to表示将要访问的路径
      2.from表示从哪个路径跳转而来
      3.next 是一个函数，表示放行
      next() 放行 next('/login') 强制跳转 */
  // 获取token 如果访问路径不是登录页面并且token值为空则强制跳转到登录界面
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path !== '/login' && !tokenStr) next('/login')
  // 加else 避免验证身份失败 执行强制跳转next()之后再执行下一个next()
  else next()
})

export default router
