<template>
  <div class="detalle-producto" v-if="producto">
    <div class="columna">
      <h1>{{ producto.producto }}</h1>
      <img :src="producto.imagen_del_producto" alt="Imagen del producto">
    </div>
    <div class="columna">
      <h1>Detalles</h1>
      <p><b>Stock disponible:</b> {{ producto.stock }}</p>
      <p><b>Calidad:</b> {{ producto.calidad }}</p>
      <p><b>Marca:</b> {{ producto.marca }}</p>
      <p><b>Precio: </b>Bs. {{ producto.precio }}</p>
    <!--<form v-if="usuarioLogueado" @submit.prevent="agregarAlCarrito">
        <h2>Cantidad para comprar</h2>
        <select v-model="cantidad">
          <option v-for="n in producto.stock" :key="n" :value="n">{{ n }}</option>
        </select>
        <button type="submit">Agregar al carrito</button>
      </form>-->
    </div>
  </div>
  <div v-else>
    <p>Producto no encontrado</p>
  </div>
</template>

<script>
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importar Firestore

export default {
  data() {
    return {
      producto: null,
      cantidad: 1,
      usuarioLogueado: true, // Simula si el usuario está logueado o no
    };
  },
  async created() {
    const productId = this.$route.params.id;
    await this.fetchProducto(productId);
  },
  methods: {
    async fetchProducto(id) {
      try {
        const db = getFirestore();
        const productoRef = doc(db, "productos", id);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
          this.producto = productoSnap.data();  // Guardar datos del producto
        } else {
          console.log("No se encontró el producto");
        }
      } catch (error) {
        console.error("Error obteniendo el producto:", error);
      }
    },
    agregarAlCarrito() {
      console.log(`Producto ${this.producto.producto} agregado con cantidad ${this.cantidad}`);
      // Aquí iría la lógica para agregar el producto al carrito
    },
  },
};
</script>

<style scoped>
.detalle-producto {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
}

.container {
    display: flex;
    justify-content: center;
    align-items: stretch;
    height: 80vh;
    
}

.columna {
    width: 25%;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 3px solid #FF9800;
    background-color: rgb(104, 226, 97);
}

.columna img {
    width: 100%;
    height: 70%;
}
img {
    width: 100%;
    height: auto;
    border: 3px solid #FF9800;
}
h1{
    text-align: center;
}
p{
    padding: 15px;
}
</style>
