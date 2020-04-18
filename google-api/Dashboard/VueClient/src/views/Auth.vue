<template>
  <div class="home">
    <HelloWorld msg="Welcome to Auth"/>
    <button type="button" class="btn btn-success mx-2" @click="loginAuth">Login Auth Service</button>
    <button type="button" class="btn btn-success mx-2" @click="loginLinkedin">Login Linkedin Service</button>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import store from '@/store'
// import AuthService from '@/utils/AuthService'
// import AuthUser from '@/utils/AuthUser'
import mgr from '@/utils/LinkedinAuthService'

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
    this.doAuth()
  },
  methods: {
    async doAuth () {
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
    loginLinkedin () {
      mgr.signinRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    }
  },
  beforeRouteEnter (to, from, next) {
    console.log('before Auth enter')
    next(vm => {
      next()
    })
  }
}
</script>
