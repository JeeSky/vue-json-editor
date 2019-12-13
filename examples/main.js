import Vue from 'vue'
import App from './App.vue'
import router from './router'


import Codemirror from '../packages'

Vue.use(Codemirror,{
  options: {
    // theme: 'rubyblue',
    // lineNumbers: true,
    mode: 'application/json',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  }
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
