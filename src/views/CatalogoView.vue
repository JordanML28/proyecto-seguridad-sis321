<template>
  <div class="catalogo">
    <div v-for="categoria in categorias" :key="categoria" class="categoria-section">
      <h1>{{ categoria }}</h1>
      <div v-if="productos[categoria]?.length">
        <div class="gallery">
          <div v-for="producto in productos[categoria]" :key="producto.id" class="image-container">
            <img :src="producto.imagen_del_producto" :alt="producto.producto" />
            <!-- Usar router-link para la navegación -->
            <router-link :to="{ name: 'DetalleProducto', params: { id: producto.id } }">
              <div class="caption">{{ producto.producto }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { ref } from "vue";
import { mapState } from 'vuex'; // Importar mapState para acceder al estado de Vuex

export default {
  name: "CatalogoView",
  computed: {
    ...mapState(['user', 'isAuthenticated']), // Accede al estado de Vuex
    username() {
      return this.user?.username || '';
    }
  },
  setup() {
    const categorias = ["Marcadores", "Colores_De_Madera", "Sketchbook", "Otros"];
    const productos = ref({});

    const fetchProductos = async () => {
      try {
        const db = getFirestore();
        const promises = categorias.map(async (categoria) => {
          const q = query(collection(db, "productos"), where("categoria", "==", categoria));
          const querySnapshot = await getDocs(q);
          productos.value[categoria] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProductos();

    return {
      categorias,
      productos,
    };
  },
};
</script>

<style scoped>
.catalogo {
  margin: 50px;
}

.categoria-section h1 {
  text-align: center;
  font-family: 'Berlin Sans FB Demi Bold', sans-serif;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  margin: 20px 0;
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
.caption:hover{
  background-color: #FF9800;
}
</style>
