<template>
  <div class="home">
    <codemirror v-model="json" :options="{

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
