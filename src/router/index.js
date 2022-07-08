import Vue from 'vue'
import VueRouter from 'vue-router'
const China = () => import('../components/china.vue')


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
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
