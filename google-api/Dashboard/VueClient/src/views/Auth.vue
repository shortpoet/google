<template>
  <div class="home">
    <HelloWorld msg="Welcome to Auth"/>
    <button type="button" class="btn btn-success mx-2" @click="loginAuth0">Login Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutAuth0">Logout Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="loginGoogle">Login Google Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutGoogle">Logout Google Service</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import store from '@/store'
import AuthService from '@/utils/AuthService'
// import AuthUser from '@/utils/AuthUser'
// import a0mgr from '@/utils/LinkedinAuthService'

const a0mgr = new AuthService({authProvider: 'auth0'}).mgr
const gomgr = new AuthService({authProvider: 'google'}).mgr


console.log(a0mgr)

export default {
  name: 'Dashboard',
  components: {
    HelloWorld
  },
  data () {
    return {
      user: null
    }
  },
  async created () {
    this.doAuthLi()
  },
  methods: {
    async doAuthLi () {
      const liuser = await a0mgr.getUser()
      if (liuser) {
        console.log(liuser)
      } else {
        // this.loginAuth()
      }
      const gouser = await gomgr.getUser()
      if (gouser) {
        console.log(gouser)
      } else {
        // this.loginAuth()
      }

      // const authService = new AuthService(this.tokenExpiredCallback, '/logincallback')
      // const user = await authService.getUser()
      // if (user && user.isAuthenticated) {
      //   this.loadUser(user)
      //   console.info('Logged In: ', user.email, user.id)
      // } else {
      //   console.info('No user initially logged in.')
      // }
    },
    loadUser (user) {
      this.user = user
    },
    tokenExpiredCallback () {
      // this.loadUser(new AuthUser())
    },
    loginAuth () {
      this.$router.push('/login')
    },
    loginAuth0 () {
      a0mgr.signinRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    },
    loginGoogle () {
      gomgr.signinRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    },
    logoutAuth0 () {
      a0mgr.signoutRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    },
    logoutGoogle () {
      gomgr.signoutRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    },
  },
  beforeRouteEnter (to, from, next) {
    console.log('before Auth enter')
    next(vm => {
      next()
    })
  }
}
</script>
