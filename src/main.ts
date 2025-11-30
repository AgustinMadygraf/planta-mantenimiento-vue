/*
Path: src/main.ts
*/

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)


// Forzar stub de login en desarrollo
if (import.meta.env.MODE === 'development') {
		// Stub usage now handled in authApi.ts
}

app.mount('#app')
