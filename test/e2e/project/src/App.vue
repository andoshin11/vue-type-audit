<template>
  <div>
    <img src="./logo.png">
    <h1>Hello Vue 3!</h1>
    <a :href="2">Link</a>
    <h2>Clicked {{ count.length }} times.</h2>
    <HelloWorld/> <!-- `HelloWorld` component requires a string prop!! -->
    <Counter/>
    <Counter @change="handleChange" @input="doNothing"/>
    <Counter @change="doSomethingToString"/> <!-- should throw handler type error -->
    <Counter @changed="handleChange"/> <!-- should throw handler name error -->
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Counter from './Counter.vue'

export default defineComponent({
  components: {
    HelloWorld,
    Counter
  },
  setup(props) {
    const count = ref(0)
    const handleChange = (val: number) => {
      count.value = val
    }
    const doSomethingToString = (val: string) => val.length
    console.log(count.value.length)
    const doNothing = () => {}
    return {
      count,
      handleChange,
      doSomethingToString,
      doNothing
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
