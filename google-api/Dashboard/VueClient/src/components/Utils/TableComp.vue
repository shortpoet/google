<template>
  <div>
    <b-row>
      <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              v-model="filter"
              type="search"
              id="filterInput"
              placeholder="Type to Search"
            ></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col sm="5" md="6" class="my-1">
        <b-form-group
          label="Per page"
          label-cols-sm="6"
          label-cols-md="4"
          label-cols-lg="3"
          label-align-sm="right"
          label-size="sm"
          label-for="perPageSelect"
          class="mb-0"
        >
          <b-form-select
            v-model="perPage"
            id="perPageSelect"
            size="sm"
            :options="pageOptions"
          ></b-form-select>
        </b-form-group>
      </b-col>

      <b-col sm="7" md="6" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>    
    <b-row>
      <b-col>
        <b-table
          responsive
          striped
          small
          hover
          selectable
          :current-page="currentPage"
          :per-page="perPage"
          :filter="filter"
          @filtered="onFiltered"
          select-mode="single"
          :items="items"
          :fields="fields"
          @row-selected="onRowSelected"
        >
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import recase from '@/utils/recase'

export default {
  name: 'TableComp',
  props: {
    msg: String,
    items: Array,
    filterFields: Array
  },
  data () {
    return {
      weather: ['no data yet'],
      filter: null,
      totalRows: 1,
      currentPage: 1,
      perPage: 5,
      pageOptions: [5, 10, 15]
    }
  },
  computed: {
    fields () {
      return this.parseFields(this.items[0]).filter(item => !this.filterFields.includes(item.key))
    }
  },
  mounted() {
      // Set the initial number of items
      // pagination empty otherwise
      this.totalRows = this.items.length
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    log () {
      document.getElementById('results').innerText = ''
      Array.prototype.forEach.call(arguments, function (msg) {
        if (msg instanceof Error) {
          msg = 'Error: ' + msg.message
        } else if (typeof msg !== 'string') {
          msg = JSON.stringify(msg, null, 2)
        }
        document.getElementById('results').innerHTML += msg + '\r\n'
      })
    },
    parseFields (datum, casing, sortable) {
      var sort = []
      if (sortable == null) {
        sort = Object.keys(datum).map(x => true)
      } else {
        sort = sortable
      }
      if (typeof datum === 'object' && datum !== null) {
        return Object.keys(datum).map((x, i) => ({
          'key': x,
          'label': recase(x),
          'sortable': sort[i]
        }))
      } else {
        throw new TypeError('This function is for an object')
      }
    },
    onRowSelected: function (items) {
      if (items[0] !== undefined) {
        var keys = this.fields.map((x, i) => { return x.key })
        var _keys = this.fields.map((x, i) => { return { key: x.key, index: i } })
        var labels = this.fields.map((x, i) => { return { index: i, key: x.label } })
        console.log(keys)
        console.log(_keys)
        console.log(labels)
        Object.entries(items[0]).forEach(([k, v], i) => {
          if (keys.includes(k)) {
            var index = _keys.filter(_k => _k.key === k)[0].index
            var label = labels.filter(l => l.index === index)[0]
            console.log(index)
            console.log(k)
            console.log(`${label.key}: ${v}`)
          }
        })
      }
    },
    logContent: function () {
      var keys = this.fields.map((x, i) => { return x.key })
      var _keys = this.fields.map((x, i) => { return { key: x.key, index: i } })
      var labels = this.fields.map((x, i) => { return { index: i, key: x.label } })
      console.log(keys)
      console.log(_keys)
      console.log(labels)
      Object.entries(this.stepGroup[0]).forEach(([k, v], i) => {
        if (keys.includes(k)) {
          var index = _keys.filter(_k => _k.key === k)[0].index
          var label = labels.filter(l => l.index === index)[0]
          console.log(index)
          console.log(k)
          console.log(`${label.key}: ${v}`)
        }
      })
    },
    logContent2: function () {
      var keys = this.fields.map((x, i) => { return x.key })
      var _keys = this.fields.map((x, i) => { return { key: x.key, index: i } })
      var labels = this.fields.map((x, i) => { return { index: i, key: x.label } })
      console.log(keys)
      console.log(_keys)
      console.log(labels)
      Object.entries(this.stepGroup[0]).forEach(([k, v], i) => {
        if (keys.includes(k)) {
          var index = _keys.filter(_k => _k.key === k)[0].index
          var label = labels.filter(l => l.index === index)[0]
          console.log(index)
          console.log(k)
          console.log(`${label.key}: ${v}`)
        }
      })
    }
  }
}
</script>
