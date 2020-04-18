<template>
  <h1>Logging in...</h1>
</template>

<script>
import AuthService from '@/utils/AuthService'
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('auth', ['loadUser'])
  },
  mounted () {
    const authService = new AuthService(() => true, '/logincallback')
    authService
      .login(this.$route.query.returnTo)
      .then(user => {
        // Will return immediately on our way to OAuth
        if (!user.isAuthenticated) return
        this.loadUser(user)
        // this.$store.dispatch('auth/loadUser', user)
        console.info(
          'Grabbed login info from local storage: ',
          user.name,
          user.id
        )

        let returnPath
        try {
          returnPath = this.$route.query.returnTo || '/'
          // returnPath = '/'
        } catch (e) {
          returnPath = '/'
        }
        this.$router.push(returnPath)
      })
      .catch(er => {
        console.warn('Error from login')
        console.error(er)
      })
  }
}
</script>
