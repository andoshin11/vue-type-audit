<template>
  <div>
    <img src="./logo.png">
    <h1>Hello Vue 3!</h1>
    <button @click="inc">Clicked {{ count.length }} times.</button>
    <HelloWorld/> <!-- `HelloWorld` component requires a prop!! -->
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'

export default defineComponent({
  components: {
    HelloWorld
  },
  setup(props) {
    const count = ref(0)
    const inc = () => {
      count.value++
    }
    console.log(count.value.length)
    return {
      count,
      inc
    }
  }
})
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
