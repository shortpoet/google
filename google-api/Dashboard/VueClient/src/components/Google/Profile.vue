<template>
  <div class="profile-container">
    
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Gmail',
  data () {
    return {
      items: null
    }
  },
  props: {
    // items: {
    //   type: Array
    // }
  },
  computed: {
    ...mapGetters('google', ['getGapiClient']),
  },
  methods: {
    ...mapActions('google', ['initClient']),
  },
  mounted() {
  }
}
</script>

<style>

</style>