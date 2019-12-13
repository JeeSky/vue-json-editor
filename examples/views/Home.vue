<template>
  <div class="home">
    <codemirror v-model="json"/>
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
