<template>
  <div class="google-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-google" @click="handleSignIn">
        Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-google" @click="handleSignOut">
        Sign Out
      </button>  
      <button ref="queryBtn" class="btn btn-google" @click="queryAPIs">
        Query
      </button>
      <!-- <button ref="queryBtn" class="btn btn-google" @click="_handleClientLoad">
        Query Orig
      </button> -->
    </div>
    <div class="api-table-container d-flex">
      <TableComp v-if="getAPIsLoaded" :items="getAPIs" :filter-fields="filterFields" />
      <TableComp v-if="items" :items="items" :filter-fields="filterFields" />
    </div>
  </div>
</template>

<script>
import TableComp from '@/components/Utils/TableComp'
import { mapGetters, mapActions, mapState } from 'vuex'
import store from '@/store'

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleIn',
  components: {
    TableComp
  },
  data () {
    return {
      filterFields: ['icons', 'kind'],
      ...mapState('google', ['gapi']),
      items: null,
      payload: {
        dDocs: 'apis',
        action: 'queryAPIs'
      }
    }
  },
  computed: {
    ...mapGetters('google', ['getAPIsLoaded', 'getAPIs'])
  },
  methods: {
    ...mapActions('google', ['initClient', 'handleSignIn', 'handleSignOut', 'queryAPIs']),
  },
  mounted () {
    this.initClient({}).then(() => {
      console.log('sign in button inititated')
    })
  }  
}
</script>

<style lang="scss">

.google-container {
  display: flex;
  flex-direction: column;
}

.button-drawer {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: center;
}

.btn-google {
  background-color: #42b983 !important;
  // font: 16px/22px Roboto;
  margin: .5rem;
  // border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
}

.api-table-container {
  margin: 1rem 1rem 1rem 1rem;
  // so that responsive container doesn't shift around too much
  min-height: 25rem;
  th {
    font-size: .70rem;
  }
  td {
    font-size: .65rem;
  }
}

</style>
