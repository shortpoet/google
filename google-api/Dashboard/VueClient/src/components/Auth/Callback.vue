<template>
    <b-row>
      <b-col>
        <div>
          <p>Sign-in in progress</p>
        </div>
      </b-col>
    </b-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Oidc from 'oidc-client'
import AuthService from '@/utils/AuthService'

export default {
  name: 'Callback',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters('auth', ['getUserManager'])
  },
  methods: {
    ...mapActions('auth', ['createOidcAuthService']),
    async redirect () {
      let authProvider
      let returnPath = '/auth'
      try {
        authProvider = this.$route.query.authProvider
        this.createOidcAuthService({authProvider: authProvider}).then((mgr) => {
          console.log(authProvider)
          console.log(mgr)
          mgr.signinRedirectCallback().then((user) => {
            console.log(user)
            window.location = '/auth'
            // this can be implemented in authservice currently undefined
            // console.log(user.isAuthenticated)
            // this.$router.push(returnPath)
          })
        })
      } catch (e) {
        console.error(e)
        console.log('error with auth provider query')
        // TODO
        // this.$router.push({ name: 'Unauthorized' })
      }
    },
    redirect2() {
      var mgr = new Oidc.UserManager({ userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })});
      console.log(mgr)
      mgr.signinRedirectCallback().then(function (user) {
        // window.location = '/auth'
      }).catch(function (err) {
        console.log(err)
      });
    },
    redirect3() {
      const authProvider = this.$route.query.authProvider.toLowerCase()
      console.log(authProvider)
      var mgr = this.getUserManager(authProvider)
      console.log(mgr)
      mgr.signinRedirectCallback().then(function (user) {
        // window.location = '/auth'
      }).catch(function (err) {
        console.log(err)
      });
    }
  },
  created: function () {
    console.log(this.$store)
    this.$route.query.authProvider === 'GOOGLE' ?
    this.redirect()
    :
    this.redirect()
  }
}
</script>
