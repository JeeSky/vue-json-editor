<template>
  <div class="vue_json_editors" :class="{ merge }">
    <div ref="merge" v-if="merge"></div>
    <textarea ref="textarea" :name="name" :placeholder="placeholder" v-else/>
    <button
        v-if="fullScreen" class="vue_json_editors_btn"
        :class="{fullScreen:isFullscreen}"
        @click="full">
      <i v-if="isFullscreen" class="iconfont icon-suoxiao"/>
      <i v-else class="iconfont icon-quanping"/>
    </button>
  </div>
</template>

<script>
  /**
   * 固定引入
   * */
  require('script-loader!jsonlint')
  import _CodeMirror from 'codemirror'
  import element from 'vue-json-editors/src/mixins/element'
  import 'vue-json-editors/src/icon/iconfont.css'
  import 'codemirror/addon/lint/lint.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/rubyblue.css'
  import 'codemirror/addon/display/fullscreen.css'

  import 'codemirror/addon/lint/lint'
  import 'codemirror/addon/lint/json-lint'
  import 'codemirror/addon/display/fullscreen'


  const CodeMirror = window.CodeMirror || _CodeMirror

  // export
  export default {
    name: 'VueJsonEditor',
    mixins: [element],
    data() {
      return {
        content: '',
        codemirror: null,
        cmInstance: null,
        isFullscreen: false,
      }
    },
    props: {
      code: String,
      value: String,
      marker: Function,
      unseenLines: Array,
      name: {
        type: String,
        default: 'codemirror'
      },
      placeholder: {
        type: String,
        default: ''
      },
      merge: {
        type: Boolean,
        default: false
      },
      options: {
        type: Object,
        default: () => ({})
      },
      events: {
        type: Array,
        default: () => ([])
      },
      globalOptions: {
        type: Object,
        default: () => ({})
      },
      globalEvents: {
        type: Array,
        default: () => ([])
      },
      fullScreen: {
        type: Boolean,
        default: true,
      },
      height: {
        type: String,
        default: ''
      },
    },
    watch: {
      options: {
        deep: true,
        handler(options) {
          for (const key in options) {
            if (key === 'refresh') {
              if (options[key]) this.refresh()
            } else {
              this.cmInstance.setOption(key, options[key])
            }
          }
        }
      },
      merge() {
        this.$nextTick(this.switchMerge)
      },
      code(newVal) {
        this.handelCodeChange(newVal)
      },
      value(newVal) {
        this.handelCodeChange(newVal)
      },
    },
    methods: {
      initialize() {
        const cmOptions = Object.assign({}, this.globalOptions, this.options)
        if (this.merge) {
          this.codemirror = CodeMirror.MergeView(this.$refs.merge, cmOptions)
          this.cmInstance = this.codemirror.edit
        } else {
          this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea, cmOptions)
          this.cmInstance = this.codemirror
          this.cmInstance.setValue(this.code || this.value || this.content)
        }
        this.cmInstance.on('change', cm => {
          this.content = cm.getValue()
          if (this.$emit) {
            this.$emit('input', this.content)
          }
        })

        this.cmInstance.setOption("extraKeys", {
          Esc: () => {
            if (!this.cmInstance.getOption('fullScreen')) return
            this.cmInstance.setOption('fullScreen', false)
            this.isFullscreen = this.cmInstance.getOption('fullScreen')
          }
        })

        if (this.height) this.resize(this.height)

        // 所有有效事件（驼峰命名）+ 去重
        const tmpEvents = {}
        const allEvents = [
          'scroll',
          'changes',
          'beforeChange',
          'cursorActivity',
          'keyHandled',
          'inputRead',
          'electricInput',
          'beforeSelectionChange',
          'viewportChange',
          'swapDoc',
          'gutterClick',
          'gutterContextMenu',
          'focus',
          'blur',
          'refresh',
          'optionChange',
          'scrollCursorIntoView',
          'update'
        ]
          .concat(this.events)
          .concat(this.globalEvents)
          .filter(e => (!tmpEvents[e] && (tmpEvents[e] = true)))
          .forEach(event => {
            // 循环事件，并兼容 run-time 事件命名
            this.cmInstance.on(event, (...args) => {
              // console.log('当有事件触发了', event, args)
              this.$emit(event, ...args)
              const lowerCaseEvent = event.replace(/([A-Z])/g, '-$1').toLowerCase()
              if (lowerCaseEvent !== event) {
                this.$emit(lowerCaseEvent, ...args)
              }
            })
          })

        this.$emit('ready', this.codemirror)
        this.unseenLineMarkers()

        // prevents funky dynamic rendering
        this.refresh()
      },
      refresh() {
        this.$nextTick(() => {
          this.cmInstance.refresh()
        })
      },
      destroy() {
        // garbage cleanup
        const element = this.cmInstance.doc.cm.getWrapperElement()
        element && element.remove && element.remove()
      },
      handelCodeChange(newVal) {
        const cm_value = this.cmInstance.getValue()
        if (newVal !== cm_value) {
          const scrollInfo = this.cmInstance.getScrollInfo()
          const cmOptions = Object.assign({}, this.globalOptions, this.options)
          this.cmInstance.setValue(newVal)
          this.content = newVal
          if (cmOptions.toEnd) {
            this.cmInstance.execCommand('goDocEnd')
          } else {
            this.cmInstance.scrollTo(scrollInfo.left, scrollInfo.top)
          }
        }
        this.unseenLineMarkers()
      },
      unseenLineMarkers() {
        if (this.unseenLines !== undefined && this.marker !== undefined) {
          this.unseenLines.forEach(line => {
            const info = this.cmInstance.lineInfo(line)
            this.cmInstance.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : this.marker())
          })
        }
      },
      switchMerge() {
        // Save current values
        const history = this.cmInstance.doc.history
        const cleanGeneration = this.cmInstance.doc.cleanGeneration
        this.options.value = this.cmInstance.getValue()

        this.destroy()
        this.initialize()

        // Restore values
        this.cmInstance.doc.history = history
        this.cmInstance.doc.cleanGeneration = cleanGeneration
      },
      validate(callback) {
        const cmOptions = Object.assign({}, this.globalOptions, this.options)
        if (typeof callback !== 'function' && window.Promise) {
          return new window.Promise((resolve, reject) => {
            callback = function (valid) {
              valid ? resolve(valid) : reject(valid)
            }
          })
        }
        let valid = true
        if (cmOptions.mode === 'application/json') {
          let result = null
          try {
            result = eval("(" + this.cmInstance.getValue() + ")")
          } catch (e) {

          }
          let final = Object.prototype.toString.call(result)
          if (final === '[object Object]' || final === '[object Array]') {
            valid = true
          } else {
            valid = false
          }
        }
        callback(valid)
      },
      full() {
        this.cmInstance.setOption('fullScreen', !this.cmInstance.getOption('fullScreen'))
        this.isFullscreen = this.cmInstance.getOption('fullScreen')
        document.getElementsByClassName('CodeMirror-fullscreen')
      },
      resize(height) {
        this.cmInstance.setSize('auto', height)
      },
    },
    mounted() {
      this.initialize()
    },
    beforeDestroy() {
      this.destroy()
    }
  }
</script>

<style scoped lang="scss">
  .vue_json_editors {
    position: relative;
    height: 100%;
    font-size: 14px;
    line-height: 1.5;
    text-align: left;

    .CodeMirror-fullscreen {
      display: none;
    }

    .vue_json_editors_btn {
      z-index: 100;
      outline: none;
      line-height: 1.499;
      position: absolute;
      right: 10px;
      top: 10px;
      display: inline-block;
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      background-image: none;
      border: none;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
      cursor: pointer;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      user-select: none;
      touch-action: manipulation;
      height: 28px;
      padding: 0 15px;
      font-size: 14px;
      border-radius: 12px;
      color: #ffffff;
      background-color: transparent;
      opacity: .65;

      &:hover {
        color: #40a9ff;
        border-color: #40a9ff;
        background-color: #ffffff;
        opacity: 1;
      }

      &.fullScreen{
        position: fixed;
      }
    }

  }

  .spe_svg {
    margin-left: 0 !important;
  }
</style>
