<template>
  <h1>Processing login...</h1>
</template>

<script>
import AuthService from '@/utils/AuthService'
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('auth', ['loadUser'])
  },
  mounted () {
    // debugger
    const authService = new AuthService(() => true, '/logincallback')
    authService.signInCallback().then(user => {
      console.log(user)
      if (!user.isAuthenticated) return
      // debugger
      this.loadUser(user)
      // this.$store.dispatch('auth/loadUser', user)
      console.info(
        'Ran through SSO Tile and logged in: ',
        user.name,
        user.id
      )

      let returnPath
      try {
        returnPath = this.$route.query.returnTo || '/'
        // console.log('return path')
        // console.log(returnPath)
        // console.log(this.$route.query)
        // returnPath = '/'
      } catch (e) {
        returnPath = '/'
      }
      this.$router.push(returnPath)
    })
  }
}
</script>
