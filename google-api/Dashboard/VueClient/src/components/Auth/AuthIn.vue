<template>
  <div class="home">
    <HelloWorld msg="Welcome to Auth"/>
    <button type="button" class="btn btn-success mx-2" @click="loginAuth0">Login Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutAuth0">Logout Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="loginGoogle">Login Google Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutGoogle">Logout Google Service</button>
    <div
      v-if="getIsAuth(authProvider)"
    >
    <p>
      You are signed in as:
    </p>
    <div style="width:100%;max-width:640px;height: 200px;margin: 0 auto;font-family: monospace;" v-html="userDisplay(authProvider)"></div>
    <p>
      Id token
    </p>
    <p>
      expires {{ new Date(getOidcIdTokenExp(authProvider)).toISOString() }}
    </p>
    <textarea readonly style="width:100%;max-width:640px;height: 200px;margin: 0 auto;font-family: monospace;" v-model="getOidcIdToken"></textarea>

  </div>
  <p v-else>You are not signed in</p>

  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import AuthService from '@/utils/AuthService'
import { mapGetters, mapActions, mapState } from 'vuex'
import jsonMarkup from 'json-markup'

// const a0mgr = new AuthService({authProvider: 'auth0'}).mgr
// const gomgr = new AuthService({authProvider: 'google'}).mgr

export default {
  name: 'AuthIn',
  components: {
    HelloWorld
  },
  data () {
    return {
      user: null,
      authProvider: 'auth0'
    }
  },
  computed: {
    ...mapGetters('auth', ['getIsAuth', 'getOidcIdTokenExp', 'getOidcIdToken', 'getUser'])
  },
  async created () {
    // this.doAuthLi()
    console.log(this)
    console.log(this.getOidcIdToken(this.authProvider))
    const a0mgr = await this.createOidcAuthService({authProvider: 'auth0'})
    const gomgr = await this.createOidcAuthService({authProvider: 'google'})
    this.loadOidcAuthService({authProvider: 'auth0', userManager: a0mgr, route: this.$route.fullPath})
    this.loadOidcAuthService({authProvider: 'google', userManager: gomgr, route: this.$route.fullPath})
  },
  methods: {
    ...mapActions('auth', ['createOidcAuthService', 'loadOidcAuthService', 'authenticate']),
    userDisplay (authProvider) {
      console.log(authProvider)
      console.log(this.getUser(authProvider))
      return jsonMarkup(this.getUser(authProvider))
    },
    async doAuthLi () {
    },
    tokenExpiredCallback () {
      // this.loadUser(new AuthUser())
    },
    loginAuth0 () {
      console.log('commencing auth0 login from authin')
      this.authenticate({route: this.$route.fullPath, provider: 'auth0'})
    },
    loginGoogle () {
    },
    logoutAuth0 () {
      // a0mgr.signoutRedirect()
      // // returnPath ? mgr.signinRedirect({ state: returnPath })
      // //   : mgr.signinRedirect()
    },
    logoutGoogle () {
      // gomgr.signoutRedirect()
      // // returnPath ? mgr.signinRedirect({ state: returnPath })
      // //   : mgr.signinRedirect()
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
