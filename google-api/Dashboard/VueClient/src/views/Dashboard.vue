<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <GoogleYn @done="onUserLoggedIn"/>
    <GoogleIn @done="onUserLoggedIn"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import GoogleYn from '@/components/Auth/GoogleYn.vue'
import GoogleIn from '@/components/Auth/GoogleIn.vue'

export default {
  name: 'Dashboard',
  components: {
    HelloWorld,
    GoogleYn,
    GoogleIn
  },
  methods: {
    onUserLoggedIn (user) {
      console.log(user)
    }
  },
  beforeRouteEnter (to, from, next) {
    console.log('before Dashboard enter')
    next(vm => {
      next()
    })
},

}
</script>
