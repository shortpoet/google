<template>
  <div class="home">
    <div
      v-if="getUserLoaded(authProvider)"
    >
    <p>
      You are signed in as:
    </p>
    <div style="width:100%;max-width:640px;height: 200px;margin: 0 auto;font-family: monospace;" v-html="userDisplay(authProvider)"></div>
    <p>
      Id token
    </p>
    <p>
      expires {{ new Date(getOidcIdTokenExp(authProvider)).toISOString() }}
    </p>
    <textarea readonly style="width:100%;max-width:640px;height: 200px;margin: 0 auto;font-family: monospace;" v-model="getToken"></textarea>

  </div>
  <p v-else>You are not signed in</p>

  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from 'vuex'
import jsonMarkup from 'json-markup'


export default {
  name: 'UserDisplay',
  components: {
  },
  props: {
    authProvider: {
      type: String
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters('auth', ['getIsAuth', 'getUserLoaded', 'getOidcIdTokenExp', 'getOidcIdToken', 'getUser']),
    getToken () {
      return this.getOidcIdToken(this.authProvider)
    }
  },
  async created () {
  },
  methods: {
    userDisplay (authProvider) {
      return jsonMarkup(this.getUser(authProvider))
    },
  }
}
</script>
