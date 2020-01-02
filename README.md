# vue-json-editors

Vue Json Editor for Vue.
基于[Codemirror](https://www.baidu.com) 使用于Vue的Web Json编辑器。 

## Installation
##### NPM
```shell
npm install vue-json-editors
```

## Mount
##### global
```js
import Vue from 'vue'
import VueJsonEditors from 'vue-json-editors'

// you can set default global options and events when use
Vue.use(VueJsonEditors, /* { 
  options: { theme: 'rubyblue', lineNumbers:true, ... },
  events: ['scroll', ...]
} */)
```

## Usage
```js
<template>
  <div>
    <vue-json-editor v-model="json" :options="options"/>
  </div>
</template>

<script>
  export default {
    name: 'home',
    data() {
      return {
        json: '{}',
        options: {
          //theme:'rubyblue',        //default
          //lineNumbers:true,        //default
          mode: 'application/json',
          readOnly: true
        },
      }
    },
  }
</script>
```

Methods | Description 
-|---------
validate(valid)|验证json格式是否正确
关羽|打
张飞|骂



## Author
[JeeSky](https://github.com/JeeSky)

