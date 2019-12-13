<template>
  <div class="d_codemirror" :class="{ merge }">
    <div ref="mergeview" v-if="merge"></div>
    <textarea ref="textarea" :name="name" :placeholder="placeholder" v-else></textarea>
    <button
        v-if="fullScreen" class="codemirror_btn"
        @click="full">
      <i v-if="isFullscreen" class="iconfont icon-suoxiao"></i>
      <i v-else class="iconfont icon-quanping"></i>
    </button>
  </div>
</template>

<script>
  import element from '../src/mixins/element.js'

  require('script-loader!jsonlint')
  import _CodeMirror from 'codemirror'
  import 'codemirror/addon/lint/lint.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/rubyblue.css'
  import 'codemirror/addon/display/fullscreen.css'
  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/addon/lint/lint'
  import 'codemirror/addon/lint/json-lint'
  import 'codemirror/addon/display/fullscreen'
  import 'codemirror/mode/python/python'
  import 'codemirror/mode/shell/shell'

  const CodeMirror = window.CodeMirror || _CodeMirror

  // pollfill
  if (typeof Object.assign != 'function') {
    Object.defineProperty(Object, 'assign', {
      value(target, varArgs) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }
        const to = Object(target)
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index]
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey]
              }
            }
          }
        }
        return to
      },
      writable: true,
      configurable: true
    })
  }

  // export
  export default {
    name: 'VueJsonEditor',
    mixins: [element],
    data() {
      return {
        content: '',
        codemirror: null,
        cminstance: null,
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
              this.cminstance.setOption(key, options[key])
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
          this.codemirror = CodeMirror.MergeView(this.$refs.mergeview, cmOptions)
          this.cminstance = this.codemirror.edit
        } else {
          this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea, cmOptions)
          this.cminstance = this.codemirror
          this.cminstance.setValue(this.code || this.value || this.content)
        }
        this.cminstance.on('change', cm => {
          this.content = cm.getValue()
          if (this.$emit) {
            this.$emit('input', this.content)
          }
        })

        this.cminstance.setOption("extraKeys", {
          Esc: () => {
            if (!this.cminstance.getOption('fullScreen')) return
            this.cminstance.setOption('fullScreen', false)
            this.isFullscreen = this.cminstance.getOption('fullScreen')
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
            this.cminstance.on(event, (...args) => {
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
          this.cminstance.refresh()
        })
      },
      destroy() {
        // garbage cleanup
        const element = this.cminstance.doc.cm.getWrapperElement()
        element && element.remove && element.remove()
      },
      handelCodeChange(newVal) {
        const cm_value = this.cminstance.getValue()
        if (newVal !== cm_value) {
          const scrollInfo = this.cminstance.getScrollInfo()
          const cmOptions = Object.assign({}, this.globalOptions, this.options)
          this.cminstance.setValue(newVal)
          this.content = newVal
          if (cmOptions.toEnd) {
            this.cminstance.execCommand('goDocEnd')
          } else {
            this.cminstance.scrollTo(scrollInfo.left, scrollInfo.top)
          }
        }
        this.unseenLineMarkers()
      },
      unseenLineMarkers() {
        if (this.unseenLines !== undefined && this.marker !== undefined) {
          this.unseenLines.forEach(line => {
            const info = this.cminstance.lineInfo(line)
            this.cminstance.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : this.marker())
          })
        }
      },
      switchMerge() {
        // Save current values
        const history = this.cminstance.doc.history
        const cleanGeneration = this.cminstance.doc.cleanGeneration
        this.options.value = this.cminstance.getValue()

        this.destroy()
        this.initialize()

        // Restore values
        this.cminstance.doc.history = history
        this.cminstance.doc.cleanGeneration = cleanGeneration
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
            result = eval("(" + this.cminstance.getValue() + ")")
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
        this.cminstance.setOption('fullScreen', !this.cminstance.getOption('fullScreen'))
        this.isFullscreen = this.cminstance.getOption('fullScreen')
        document.getElementsByClassName('CodeMirror-fullscreen')
      },
      resize(height) {
        this.cminstance.setSize('auto', height)
      },
    },
    mounted() {
      console.log(124)
      this.initialize()
    },
    beforeDestroy() {
      this.destroy()
    }
  }
</script>

<style scoped lang="scss">
  .d_codemirror {
    position: relative;
    height: 100%;
    font-size: 14px;
    line-height: 1.5;

    .CodeMirror-fullscreen {
      display: none;
    }

    .codemirror_btn {
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
    }

  }

  .spe_svg {
    margin-left: 0 !important;
  }
</style>
