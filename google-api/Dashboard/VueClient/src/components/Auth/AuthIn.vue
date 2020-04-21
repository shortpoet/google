<template>
  <div class="home">
    <HelloWorld msg="Welcome to Auth"/>
    <button type="button" class="btn btn-success mx-2" @click="loginAuth0">Login Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutAuth0">Logout Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="loginGoogle">Login Google Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutGoogle">Logout Google Service</button>
    <UserDisplay :auth-provider="'auth0'" />
    <UserDisplay :auth-provider="'google'" />
  </div>
</template>

<script>
// @ is an alias to /src
import UserDisplay from '@/components/Auth/UserDisplay.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import AuthService from '@/utils/AuthService'
import { mapGetters, mapActions, mapState } from 'vuex'

export default {
  name: 'AuthIn',
  components: {
    HelloWorld,
    UserDisplay
  },
  data () {
    return {
      user: null,
      authProvider: 'auth0'
    }
  },
  computed: {
    ...mapGetters('auth', ['getIsAuth', 'getUserLoaded', 'getOidcIdTokenExp', 'getOidcIdToken', 'getUser']),
  },
  async created () {
    const a0mgr = await this.createOidcAuthService({authProvider: 'auth0'})
    const gomgr = await this.createOidcAuthService({authProvider: 'google'})
    this.loadOidcAuthService({authProvider: 'auth0', userManager: a0mgr, route: this.$route})
    this.loadOidcAuthService({authProvider: 'google', userManager: gomgr, route: this.$route})
  },
  methods: {
    ...mapActions('auth', ['createOidcAuthService', 'loadOidcAuthService', 'authenticate', 'logout']),
    tokenExpiredCallback () {
      // this.loadUser(new AuthUser())
    },
    loginAuth0 () {
      console.log('commencing auth0 login from authin')
      this.authenticate({route: this.$route.fullPath, authProvider: 'auth0'})
    },
    loginGoogle () {
      this.authenticate({route: this.$route.fullPath, authProvider: 'google'})
    },
    logoutAuth0 () {
      this.logout({authProvider: 'auth0'})
    },
    logoutGoogle () {
      this.logout({authProvider: 'google'})
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
