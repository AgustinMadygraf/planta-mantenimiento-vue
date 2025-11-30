console.log('Importing dependencies...')
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'
import App from './App.vue'

console.log('Creating app...')
const app = createApp(App)

console.log('Installing plugins...')
app.use(createPinia())
app.use(router)

console.log('Mounting app...')
app.mount('#app')
console.log('App mounted')
