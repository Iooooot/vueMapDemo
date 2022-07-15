import Vue from 'vue'
import VueRouter from 'vue-router'
const China = () => import('../components/china.vue')
import Layout from '../layout'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // component: Layout,
    redirect: '/china'
  },
  {
    path: '/china',
    component: China,
  },
]

const router = new VueRouter({
  routes
})

export default router
