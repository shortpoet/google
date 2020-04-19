<template>
  <h1>Logging out...</h1>
</template>

<script>
export default {
  mounted () {
    // Object.keys(localStorage).forEach(i => console.log(i))
    for (var i = 0; i < localStorage.length; i++) {
      let lskey = window.localStorage.key(i)
      if (lskey.startsWith('oidc.user')) {
        console.log('Deleting localStorage key: ' + lskey)
        localStorage.removeItem(lskey)
        this.$store.commit('auth/RESET_USER')
      } else console.log('Skipping localStorage key: ' + lskey)
    }
    this.$router.push('/')
  }
}
</script>
