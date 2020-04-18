<template>
  <div class="auth-container">
    <h4 class="w-100 p-0">Auth Start</h4>
    <br />
    <ul>
      <li
        v-for="(value, key, i) in getHeaders"
        :key="i"
      >
        <b>{{ key }}:</b> {{ value }}
      </li>
    </ul>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Identity',
  props: [],
  data: function () {
    return {
    }
  },
  computed: {
    ...mapGetters('auth', [
      'getHeaders',
      'getHeadersLoaded'
    ]),
    loaded: function () {
      console.log(this.getHeadersLoaded)
      return this.getHeadersLoaded === true
    }
  },
  methods: {
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
