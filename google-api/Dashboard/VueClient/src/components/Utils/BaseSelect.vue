<template>
  <div>
    <label v-if="label">{{ label }}</label>
    <select 
      class="form-control"
      :value="value"
      @change="updateValue"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <option
        v-for="option in options"
        :disabled="option.disabled ? option.disabled : false"
        :value="option.value"
        :key="option.name"
        :selected="option === value"
      >{{ option.name }}</option>
    </select>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  props: {
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    value: [String, Number]
  },
  methods: {
    updateValue(event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
