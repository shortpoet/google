<template>
  <h1>Logging in...</h1>
</template>

<script>
import AuthService from '@/utils/AuthService'
import { mapActions } from 'vuex'
import Oidc from 'oidc-client'
import limgr from '@/utils/LinkedinAuthService'
import gomgr from '@/utils/GoogleAuthService'

export default {
  methods: {
    ...mapActions('auth', ['loadUser'])
  },
  async created () {
    // var limgr = new Oidc.UserManager({ userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })});
    console.log(gomgr)
    const user = await gomgr.getUser()
    console.log(user)
    if (!user) {
      // this is not waiting for .then promise before reloading to the redirect page when only using signinredirect but works if comment redirect action
      gomgr.signinRedirect().then(function (user) {
      // limgr.signinRedirectCallback().then(function (user) {
        // window.location = '/auth'
      }).catch(function (err) {
        console.log(err)
      });

    }

  },
  mounted () {
    // const authService = new AuthService(() => true, '/logincallback')
    // authService
    //   .login(this.$route.query.returnTo)
    //   .then(user => {
    //     // Will return immediately on our way to OAuth
    //     if (!user.isAuthenticated) return
    //     this.loadUser(user)
    //     // this.$store.dispatch('auth/loadUser', user)
    //     console.info(
    //       'Grabbed login info from local storage: ',
    //       user.name,
    //       user.id
    //     )

    //     let returnPath
    //     try {
    //       returnPath = this.$route.query.returnTo || '/'
    //       // returnPath = '/'
    //     } catch (e) {
    //       returnPath = '/'
    //     }
    //     this.$router.push(returnPath)
    //   })
    //   .catch(er => {
    //     console.warn('Error from login')
    //     console.error(er)
    //   })
  }
}
</script>
