<template>
  <div class="home">
    <vue-json-editor v-model="json" :options="{
      readOnly:true
    }"/>
    {{json}}
  </div>
</template>

<script>
  export default {
    name: 'home',
    data() {
      return {
        json: '{}'
      }
    },
  }
</script>
