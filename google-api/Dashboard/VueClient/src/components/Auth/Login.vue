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
    this.authenticate({route: returnTo, authProvider: authProvider})
  },
  mounted () {
  }
}
</script>
