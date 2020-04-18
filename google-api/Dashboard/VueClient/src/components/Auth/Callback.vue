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
// import { mapGetters } from 'vuex'
import Oidc from 'oidc-client'
import mgr from '@/utils/LinkedinAuthService'

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
    async redirect () {
      // debugger
      try {
        var result = await mgr.signinRedirectCallback()
        var returnToUrl = '/'
        if (result.state !== undefined) {
          console.log(result)
          // debugger
          returnToUrl = result.state
        }
        this.$router.push({ path: returnToUrl })
      } catch (e) {
        this.$router.push({ name: 'Unauthorized' })
      }
    },
    redirect2 () {
      new Oidc.UserManager({ response_mode: 'query' }).signinRedirectCallback()
        .then(function () {
          window.location = 'index.html'
        }).catch(function (e) {
          console.error(e)
        })
    }
  },
  created: function () {
    console.log(this)
    this.redirect()
    // this.redirect2()
    // new Oidc.UserManager({ response_mode: 'query' })
    //   .signinRedirectCallback()
    //   .then(function () {
    //     window.location = 'index.html'
    //   }).catch(function (e) {
    //     console.error(e)
    //   })
  }
}
</script>
