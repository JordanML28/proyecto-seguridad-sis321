<template>
  <div class="home">
    <div class="gallery">
      <h1>Novedades</h1>
      <div v-if="novedades.length" class="product-grid">
        <div v-for="(producto, index) in novedades" :key="index" class="image-container">
          <img :src="producto.imagen_del_producto" :alt="producto.producto" />
          <div class="caption">{{ producto.producto }}</div>
        </div>
      </div>

      <h1>Más Vendidos</h1>
      <div v-if="masVendidos.length" class="product-grid">
        <div v-for="(producto, index) in masVendidos" :key="index" class="image-container">
          <img :src="producto.imagen_del_producto" :alt="producto.producto" />
          <div class="caption">{{ producto.producto }}</div>
        </div>
      </div>
    </div>

    <div v-if="!isAuthenticated" class="welcome-message">
      <h2>Bienvenido! Por favor, inicie sesión para acceder a más funcionalidades.</h2>
      <router-link to="/login">Iniciar Sesión</router-link>
    </div>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { useStore } from 'vuex';

export default {
  name: "HomeView",
  data() {
    return {
      novedades: [],
      masVendidos: []
    };
  },
  computed: {
    isAuthenticated() {
      const store = useStore();
      console.log(store);
      return store.getters.isAuthenticated;
    }
  },
  methods: {
    async fetchProductos() {
      try {
        const db = getFirestore();
        const qNovedades = query(collection(db, "productos"), where("seccion", "==", "Novedades"));
        const querySnapshotNovedades = await getDocs(qNovedades);
        this.novedades = querySnapshotNovedades.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const qMasVendidos = query(collection(db, "productos"), where("seccion", "==", "MasVendidos"));
        const querySnapshotMasVendidos = await getDocs(qMasVendidos);
        this.masVendidos = querySnapshotMasVendidos.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    }
  },
  mounted() {
    this.fetchProductos();
  }
};
</script>

<style scoped>
h1 {
  color: #0a0a0a; 
  font-size: 34px; 
  text-align: center; 
  margin-top: 50px;
}
.gallery {
  margin: 50px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
}
.caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}
.welcome-message {
  text-align: center;
  margin-top: 30px;
}
</style>
