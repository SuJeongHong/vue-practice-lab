<script setup>
  //import { RouterLink, RouterView } from 'vue-router'
//import UnitToggler from './components/exercise/UnitToggler.vue';
  import NavigationBar from './components/exercise/NavigationBar.vue';
 // import WeatherHomeview from './views/WeatherHomeview.vue'

</script>

<template>
  <div class="app-container">
    <NavigationBar/>

    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

nav {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
}

nav a {
  color: #37474f;
  font-weight: 600;
  text-decoration: none;
}

nav a.router-link-active {
  color: #2e7d32;
}
</style>
