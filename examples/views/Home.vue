<template>
  <div>
    <div style="height: 500px;background-color: palegoldenrod">124</div>
    <vue-json-editor v-model="json" :options="options"/>
  </div>
</template>

<script>

  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/mode/python/python'
  import 'codemirror/mode/shell/shell'

  export default {
    name: 'home',
    data() {
      return {
        json: '{}',
        options: {
          //theme:'rubyblue',        //default
          //lineNumbers:true,        //default
          mode: 'application/json',
          readOnly: false
        },
      }
    },
  }
</script>
