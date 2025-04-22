import './assets/main.css'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import ui from '@nuxt/ui/vue-plugin'

const app = createApp(App)

app.use(createPinia())
app.use(ui)

app.mount('#app')