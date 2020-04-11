<template>
  <div ref="signinBtn" class="btn-sign-in">
    Sign In
  </div>  
</template>

<script>

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleIn',
  mounted () {
      window.gapi.load('auth2', () => {
        const auth2 = window.gapi.auth2.init({
          client_id: client_id,
          cookiepolicy: 'single_host_origin'
        })
        auth2.attachClickHandler(this.$refs.signinBtn, {}, googleUser => {
          this.$emit('done', googleUser)
        }, error => console.log(error))
      })
    }  
}
</script>

<style lang="scss">

.btn-sign-in {
  background: #fff;
  font: 16px/22px Roboto;
  padding: 4px 8px;
  border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
}

</style>
