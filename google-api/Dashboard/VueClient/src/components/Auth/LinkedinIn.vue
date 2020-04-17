<template>
  <!-- <div v-if="getGapiClientLoaded" class="google-container"> -->
  <div class="linkedin-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-linkedin" @click="signIn">
        Linkedin Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-linkedin" @click="''">
        Linkedin Sign Out
      </button>
      <!-- <BaseSelect
        :options="displayOptions"
        v-model="selectedDisplay"
      />
      <BaseSelect
        :options="queryOptions"
        v-model="selectedQuery"
      /> -->
      <button ref="queryBtn" class="btn btn-google" @click="getUser">
        Get User
      </button>
      <button ref="queryBtn" class="btn btn-google" @click="''">
        Query
      </button>
    </div>
    <div v-if="selectedDisplay === 'table'" class="api-table-container">
      <TableComp v-if="items" :items="displayItems" :filter-fields="filterFields" />
    </div>
    <div v-else-if="selectedDisplay === 'json' && items" class="api-json-container">
      <pre v-html="displayItems"></pre>
    </div>
  </div>
</template>

<script>
import TableComp from '@/components/Utils/TableComp'
// import { mapGetters, mapActions, mapState } from 'vuex'
// import BaseSelect from '@/components/Utils/BaseSelect'
// import axios from 'axios'
import mgr from '@/utils/LinkedinAuthService'

export default {
  name: 'LinkedinIn',
  components: {
    TableComp,
    // BaseSelect
  },
  data () {
    return {
      items: null,
      filterFields: ['icons', 'kind'],
      gapiClient: null,
      queryOptions: [
        {name: 'Select Query Type', value: '', disabled: true},
        {name: 'Get APIs', value: 'getApis'},
        {name: 'Gmail Labels', value: 'gmailLabels'},
        {name: 'Gmail Messages', value: 'gmailMessages'},
        {name: 'Calendar List', value: 'calendarList'},
        {name: 'Other Methods', value: 'otherMethods'},
      ],
      selectedQuery: null,
      displayOptions: [
        {name: 'Select Display Type', value: '', disabled: true},
        {name: 'JSON', value: 'json'},
        {name: 'Table', value: 'table'},
      ],
      selectedDisplay: null
    }
  },
  computed: {
  },
  methods: {
    signIn() {
      mgr.signinRedirect()
      // returnPath ? mgr.signinRedirect({ state: returnPath })
      //   : mgr.signinRedirect()
    },
    async getUser() {
      const user = await mgr.getUser()
      console.log(user)
    }
  },
  mounted () {
  }  
}
</script>

<style lang="scss">

.linkedin-container {
  display: flex;
  flex-direction: column;
}

.button-drawer {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: center;
}

.btn-linkedin {
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
