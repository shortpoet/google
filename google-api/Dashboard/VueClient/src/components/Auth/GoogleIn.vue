<template>
  <div class="google-container">
    <div class="button-drawer">
      <button ref="signinBtn" class="btn btn-google" @click="login">
        Sign In
      </button>  
      <button ref="signoutBtn" class="btn btn-google" @click="logout">
        Sign Out
      </button>  
      <button ref="queryBtn" class="btn btn-google" @click="doQuery">
        Query
      </button>
      <button ref="queryBtn" class="btn btn-google" @click="showCalendar = !showCalendar">
        Show Calendar
      </button>
      <button ref="queryBtn" class="btn btn-google" @click="showGmail = !showGmail">
        Show Gmail
      </button>
      <!-- <button ref="queryBtn" class="btn btn-google" @click="_handleClientLoad">
        Query Orig
      </button> -->
    </div>
    <div class="api-table-container d-flex">
      <TableComp v-if="getAPIsLoaded" :items="getAPIs" :filter-fields="filterFields" />
      <TableComp v-if="items" :items="items" :filter-fields="filterFields" />
      <Calendar v-if="showCalendar" />
      <Gmail v-if="showGmail" />
    </div>
  </div>
</template>

<script>
import TableComp from '@/components/Utils/TableComp'
import Calendar from '@/components/Google/Calendar'
import Gmail from '@/components/Google/Gmail'
import { mapGetters, mapActions, mapState } from 'vuex'
import store from '@/store'
import axios from 'axios'

const keyFile = require('H:/source/repos/google/google-api/js/config/oauth2.keys.json');
const client_id = keyFile.web.client_id;

export default {
  name: 'GoogleIn',
  components: {
    TableComp,
    Calendar,
    Gmail
  },
  data () {
    return {
      filterFields: ['icons', 'kind'],
      items: null,
      payload: {
        dDocs: 'apis',
        action: 'queryAPIs'
      },
      showCalendar: false,
      showGmail: false
    }
  },
  computed: {
    ...mapState('google', ['gapiClient']),
    ...mapGetters('google', ['getAPIsLoaded', 'getAPIs'])
  },
  methods: {
    ...mapActions('google', ['initClient', 'handleSignIn', 'handleSignOut', 'queryAPIs', 'list']),
    login() {
      this.$gAuth.signIn()
      console.log(this.$getAuthCode)
    },
    logout() {
      this.$gAuth.signOut()
    },
    async doQuery() {
      const token = await window.gapi.auth2.getAuthInstance().grantOfflineAccess()
      console.log(token)
      let mailurl = 'https://www.googleapis.com/gmail/v1/users/me/messages'
      let driveurl = 'https://www.googleapis.com/drive/v3/files'
      axios.get(mailurl, {
        headers: {
        'x-Requested-With': 'XMLHttpRequest',
        Authorization: 'Bearer ' + token.code,
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Expose-Headers': 'Content-Disposition'
      },
      responseType:'json',
      withCredentials: true,
      }).then((res) => {
        console.log(res)
      })
    },

    // login () {
    //   // this.$gapi.getGapiClient()
    //   this.$getGapiClient()
    //     .then(gapi => {
    //       console.log(gapi)
    //       gapi.client.sheets.spreadsheet.list()
          
    //       // gapi.client.calendar.calendarList.list({
    //       // }).then((res) => {
    //       //   console.log(res)
    //       // })

    //       // gapi.client.gmail.users.labels.list({
    //       //   'userId': 'me'
    //       // })     
    //       // .then(response => {
    //       //   console.log(response)
    //       // });


    //   })
    // },
    // logout() {
    //   this.$logout()
    // }
  },
  mounted () {
    // this.initClient({}).then(() => {
    //   console.log('sign in button inititated')
    // })
    // this.list()
    console.log(this)
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
