import Vue from 'vue'
import VueRouter from 'vue-router'

import paths from './paths.js'

const routes = function(paths) {
  return paths
    .map(path => {
      return {
        name: path.name || path.view || path.component,
        path: path.path,
        // must include '@/' at beginning of template string otherwise it doesn't work
        component: resolve => import(`@/${path.file}.vue`).then(resolve),
        // component: path.view ? resolve => import(`@/views/${path.view}.vue`).then(resolve) 
        //   : resolve => import(`@/components/Auth/${path.component}.vue`).then(resolve) ,
        beforeEnter: path.beforeEnter || ((to, from, next) => {next()})
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
