import Vue from 'vue'
import App from './App.vue'
import './assets/css/flex.css'

// dev
// import VueTableDynamic from '../../src/index.js'
// prod
import VueTableDynamic from '../../'

Vue.use(VueTableDynamic)

Vue.config.productionTip = false

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(App)
})
