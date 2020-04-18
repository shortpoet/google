/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
// import store from '/store'

const paths = [
  {
    path: '/',
    view: 'Dashboard',
    file: 'views/Dashboard',
    beforeEnter: (to, from, next) => {
      next()
    }
  },
  {
    path: '/about',
    view: 'About',
    file: 'views/About'
  },
  {
    path: '/auth',
    view: 'Auth',
    file: 'views/Auth'
  },
  // {
  //   path: '/callback',
  //   component: 'Callback',
  //   file: 'components/Auth/Callback'
  // },
  // {
  //   path: '/logincallback',
  //   component: 'LoginCallback',
  //   file: 'components/Auth/LoginCallback'
  // },
  // {
  //   path: '/login',
  //   component: 'Login',
  //   file: 'components/Auth/Login'
  // },
  // {
  //   path: '/logout',
  //   component: 'Logout',
  //   file: 'components/Auth/Logout'
  // }
]

export default paths