<template>
  <div class="item-container" v-if="items">
    <pre v-html="items"></pre>
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
    getData(gapiClient) {
      let vm = this;
      console.log('getting gmail label data')
      console.log(gapiClient)
      console.log(vm.getGapiClient)

      gapiClient.client.gmail.users.labels.list({
        'userId': 'me'
      })     
      .then(response => {
        console.log(response)
        vm.items = this.syntaxHighlight(response.result.labels);
        console.log(vm.items);
      });
    },
    syntaxHighlight(json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }
  },
  mounted() {
    this.initClient({scope: 'gmail', discoveryDocs: 'gmail'}).then((gapiClient) => {
      console.log('going to get data')
      this.getData(gapiClient);
    })
  }
}
</script>

<style>

</style>