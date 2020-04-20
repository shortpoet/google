<template>
  <div class="auth">
    <AuthIn />
  </div>
</template>

<script>
// @ is an alias to /src
import AuthIn from '@/components/Auth/AuthIn'

export default {
  name: 'Dashboard',
  components: {
    AuthIn
  },
  data () {
    return {
    }
  },
  async created () {
  },
  methods: {
  },
  beforeRouteEnter (to, from, next) {
    console.log('before Auth enter')
    next(vm => {
      next()
    })
  }
}
</script>
