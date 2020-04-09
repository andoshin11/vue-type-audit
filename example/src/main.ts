import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

declare type ClassInstance<T> = T extends new (...args: any[]) => infer U ? U : never;
