/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
// import store from '@/store'

const paths = [
  {
    path: '/',
    view: 'Dashboard',
    beforeEnter: (to, from, next) => {
      next()
    }
  },
  {
    path: '/about',
    view: 'About'
  }
]

export default paths