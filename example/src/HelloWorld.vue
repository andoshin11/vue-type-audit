<template>
  <div>
    <label>{{ label }}</label>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: 'Default Label'
    }
  }
})
</script>
