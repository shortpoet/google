<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Dashboard"/>
    <GapiIn @done="onUserLoggedIn"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import GapiIn from '@/components/Auth/GapiIn.vue'
import store from '@/store'

export default {
  name: 'Dashboard',
  components: {
    HelloWorld,
    GapiIn
  },
  methods: {
    onUserLoggedIn (user) {
      console.log(user)
    }
  },
  beforeRouteEnter (to, from, next) {
    console.log('before Dashboard enter')
    // store.dispatch('google/initClient', ).then(() => {
    //   next()
    // })

    next(vm => {
      next()
    })
},

}
</script>
