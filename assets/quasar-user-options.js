import './styles/quasar.scss'
import lang from 'quasar/lang/ru.js'
import '@quasar/extras/material-icons/material-icons.css'
import '@mdi/font/scss/materialdesignicons.scss'
import { Loading, Dialog, Dark, Notify } from 'quasar'
import * as components from 'quasar/src/components.js'
import * as directives from 'quasar/src/directives.js'

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    dark: true,
    brand: {
      primary: '#1976d2',
      secondary: '#5cbbf6',
      accent: '#9C27B0',
      dark: '#1d1d1d',
      'dark-page': '#002650',
      positive: '#4caf50',
      negative: '#dc3545',
      info: '#2196f3',
      warning: '#fb8c00'
    }
  },
  plugins: { Loading, Dialog, Dark, Notify },
  directives: directives,
  components: components,
  lang: lang
}