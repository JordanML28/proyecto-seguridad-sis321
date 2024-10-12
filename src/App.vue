<template>
  <div id="app">
    <Navbar />
    <router-view /> <!-- Aquí se renderizan las diferentes vistas según la ruta -->
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer
  }
}
</script>

<style>
/* Estilos globales */
* {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
