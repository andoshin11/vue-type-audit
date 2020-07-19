<template>
  <div>
    <h2>Click Count: {{ state.count }}</h2>
    <button @click="increment">Click me</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  emits: {
    change: (val: number) => val < 10
  },
  props: {
    initialValue: {
      type: Number,
      default: 0
    }
  },
  setup({ initialValue }, { emit }) {
    const state = reactive({
      count: initialValue
    });

    const increment = () => {
      state.count++;
      emit("change", state.count);
    };

    return {
      state,
      increment
    };
  }
});
</script>
