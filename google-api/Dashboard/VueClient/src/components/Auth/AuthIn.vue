<template>
  <div class="home">
    <HelloWorld msg="Welcome to Auth"/>
    <button type="button" class="btn btn-success mx-2" @click="loginAuth0">Login Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutAuth0">Logout Auth0 Service</button>
    <button type="button" class="btn btn-success mx-2" @click="loginGoogle">Login Google Service</button>
    <button type="button" class="btn btn-success mx-2" @click="logoutGoogle">Logout Google Service</button>
    <div
      v-if="getIsAuth('google')"
    >
    <p>
      You are signed in as:
    </p>
    <div style="width:100%;max-width:640px;height: 200px;margin: 0 auto;font-family: monospace;" v-html="userDisplay('google')"></div>
    <p>
      Id token
    </p>
    <p>
      expires {{ new Date(getOidcIdTokenExp('google')).toISOString() }}
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
      user: null
    }
  },
  computed: {
    ...mapGetters('auth', ['getIsAuth', 'getOidcIdTokenExp', 'getOidcIdToken'])
  },
  async created () {
    // this.doAuthLi()
    console.log(this)
    const a0mgr = await this.createOidcAuthService({authProvider: 'auth0'})
    const gomgr = await this.createOidcAuthService({authProvider: 'google'})
    this.loadOidcAuthService({type: 'auth0', provider: a0mgr})
    this.loadOidcAuthService({type: 'google', provider: gomgr})
  },
  methods: {
    ...mapActions('auth', ['createOidcAuthService', 'loadOidcAuthService', 'authenticate', 'getUser']),
    async userDisplay (provider) {
      console.log(provider)
      console.log(await this.getUser(provider))
      return jsonMarkup(await this.getUser(provider))
    },
    async doAuthLi () {
    },
    tokenExpiredCallback () {
      // this.loadUser(new AuthUser())
    },
    loginAuth0 () {
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
