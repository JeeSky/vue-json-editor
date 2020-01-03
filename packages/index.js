/*
* Vue-Json-Editor
* Author: liushuxiang19930729@gmial.com
* Github: https://github.com/JeeSky/vue-json-editor
*/

import editor from './Index.vue'

const install = (Vue, config) => {
  if (config) {
    if (config.options) {
      if (!config.options.theme) config.options.theme = 'rubyblue'
      if (config.options.lineNumbers === null || config.options.lineNumbers === undefined || config.options.lineNumbers === '') config.options.lineNumbers = true
      editor.props.globalOptions.default = () => config.options
    }
    if (config.events) {
      editor.props.globalEvents.default = () => config.events
    }
  }
  Vue.component(editor.name, editor)
}

export {editor}

export default install
