<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink> |
      <RouterLink to="/edt">EDT</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>

</style>
