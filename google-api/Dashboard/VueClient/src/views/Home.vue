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

export default {
  name: 'Home',
  components: {
    HelloWorld,
    GoogleIn
  },
  methods: {
    onUserLoggedIn (user) {
      console.log(user)
    }
  }
}
</script>
