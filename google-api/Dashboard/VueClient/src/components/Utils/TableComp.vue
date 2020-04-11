<template>
    <b-row>
      <b-col>
        <b-table
          responsive
          striped
          small
          hover
          selectable
          select-mode="single"
          :items="items"
          :fields="fields"
          @row-selected="onRowSelected"
        >
        </b-table>
      </b-col>
    </b-row>
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
      weather: ['no data yet']
    }
  },
  computed: {
    fields () {
      return this.parseFields(this.items[0]).filter(item => !this.filterFields.includes(item.key))
    }
  },
  methods: {
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
