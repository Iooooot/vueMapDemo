import Vue from 'vue'
import VueRouter from 'vue-router'
const China = () => import('../components/china.vue')
const Test = () => import('../components/test.vue')
import Layout from '../layout'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // component: Layout,
    redirect: '/test'
  },
  {
    path: '/test',
    component: Test,
  },
]

const router = new VueRouter({
  routes
})

export default router
