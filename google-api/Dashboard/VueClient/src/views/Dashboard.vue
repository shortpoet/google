<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <GoogleIn @done="onUserLoggedIn"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import GoogleIn from '@/components/Auth/GoogleIn.vue'
import store from '@/store'

export default {
  name: 'Dashboard',
  components: {
    HelloWorld,
    GoogleIn
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
