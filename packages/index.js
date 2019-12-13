/*
* Vue-Json-Editor
* Author: liushuxiang19930729@gmial.com
* Github: https://github.com/JeeSky/vue-json-editor
*/

import codemirror from './Index.vue'

const install = (Vue, config) => {
  if (config) {
    if (config.options) {
      if (!config.options.theme) config.options.theme = 'rubyblue'
      if (config.options.lineNumbers === null || config.options.lineNumbers === undefined || config.options.lineNumbers === '') config.options.lineNumbers = true
      codemirror.props.globalOptions.default = () => config.options
    }
    if (config.events) {
      codemirror.props.globalEvents.default = () => config.events
    }
  }
  Vue.component(codemirror.name, codemirror)
}

export default {
  codemirror,
  install
}
