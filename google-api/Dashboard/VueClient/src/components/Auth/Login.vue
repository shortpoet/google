<template>
  <h1>Logging in...</h1>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('auth', ['authenticate'])
  },
  async created () {
    const authProvider = this.$route.query.authProvider
    const returnTo = this.$route.query.returnTo
    console.log(authProvider)
    console.log(returnTo)
    this.authenticate({route: returnTo, authProvider: authProvider})
  },
  mounted () {
  }
}
</script>
