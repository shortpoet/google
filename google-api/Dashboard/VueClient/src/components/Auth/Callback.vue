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
import limgr from '@/utils/LinkedinAuthService'
import gomgr from '@/utils/GoogleAuthService'

var mgr = limgr
mgr = gomgr

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
    redirect3 () {
      var mgr = new Oidc.UserManager({ userStore: new Oidc.WebStorageStateStore({ store: window.localStorage, loadUserInfo: true })});
      console.log(mgr)
      mgr.signinRedirectCallback().then(function (user) {
        window.location = '/auth'
      }).catch(function (err) {
        console.log(err)
      });
    },
    async redirect () {
      // debugger
      try {
        // var result = await mgr.signinRedirectCallback()
        
        // console.log(result)
        var returnToUrl = '/auth'
        window.location = '/auth'
        // if (result.state !== undefined) {
        //   console.log(result)
        //   // debugger
        //   returnToUrl = result.state
        // }
        // this.$router.push({ path: returnToUrl })
      } catch (e) {
        console.error(e)
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
    this.redirect3()
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
