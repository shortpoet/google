import Vue from 'vue'
import VueRouter from 'vue-router'

import paths from './paths.js'

const routes = function(paths) {
  return paths
    .map(path => {
      return {
        name: path.name || path.view,
        path: path.path,
        component: resolve => import(`@/views/${path.view}.vue`).then(resolve),
        beforeEnter: path.beforeEnter || (() => {})
      }
    })
    // catch-all route
    // .concat([{path: '*', redirect: '/resume'}])
}

// console.log(paths)
// var x = routes(paths)
// console.log(x)

const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  }
  if (to.hash) {
    return { selector: to.hash }
  }
  return { x: 0, y: 0 }
}

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes(paths),
  scrollBehavior: scrollBehavior
})

export default router
