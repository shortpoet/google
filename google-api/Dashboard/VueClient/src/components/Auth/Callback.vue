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
import { mapActions } from 'vuex'

export default {
  name: 'Callback',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    ...mapActions('auth', ['createOidcAuthService']),
    async redirect () {
      let authProvider
      let returnPath = '/auth'
      try {
        authProvider = this.$route.query.authProvider
        this.createOidcAuthService({authProvider: authProvider}).then((mgr) => {
          console.log(mgr)
          mgr.signinRedirectCallback().then((user) => {
            console.log(user)
            // this can be implemented in authservice currently undefined
            // console.log(user.isAuthenticated)
            this.$router.push(returnPath)
          })
        })
      } catch (e) {
        console.error(e)
        console.log('error with auth provider query')
        // TODO
        // this.$router.push({ name: 'Unauthorized' })
      }
    },
  },
  created: function () {
    this.redirect()
  }
}
</script>
