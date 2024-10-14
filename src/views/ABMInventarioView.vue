<template>
  <div>
    <h1>Administrar Productos</h1>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Imagen</th>
            <th>Marca</th>
            <th>Calidad</th>
            <th>Categoría</th>
            <th>Sección</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id">
            <td>{{ producto.id }}</td>
            <td>{{ producto.producto }}</td>
            <td>
              <a :href="producto.imagen_del_producto" target="_blank">
                <img :src="producto.imagen_del_producto" alt="Imagen del Producto" width="50" />
              </a>
            </td>
            <td>{{ producto.marca }}</td>
            <td>{{ producto.calidad }}</td>
            <td>{{ producto.categoria }}</td>
            <td>{{ producto.seccion }}</td>
            <td>{{ producto.precio }}</td>
            <td>{{ producto.stock }}</td>
            <td>
              <button class="editar" @click="editarProducto(producto)">Editar</button>
              <button class="eliminar" @click="eliminarProducto(producto.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <form v-if="productoSeleccionado">
      <h1>Editar Producto</h1>
      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Imagen (Link)</th>
              <th>Marca</th>
              <th>Calidad</th>
              <th>Categoría</th>
              <th>Sección</th>
              <th>Precio</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>{{ productoSeleccionado.id }}</td>
                <td><input v-model="productoSeleccionado.producto" /></td>
                <td><input v-model="productoSeleccionado.imagen_del_producto" /></td>
                <td><input v-model="productoSeleccionado.marca" /></td>
                <td><input v-model="productoSeleccionado.calidad" /></td>
                <td><input v-model="productoSeleccionado.categoria" /></td>
                <td><input v-model="productoSeleccionado.seccion" /></td>
                <td><input v-model.number="productoSeleccionado.precio" type="number" /></td> <!-- Campo numérico -->
                <td><input v-model.number="productoSeleccionado.stock" type="number" /></td> <!-- Campo numérico -->
            </tr>
          </tbody>
        </table>
      </div>
      <button @click.prevent="guardarCambios">Guardar Cambios</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  name: 'ABMInventarioView',
  setup() {
    const productos = ref([]);
    const productoSeleccionado = ref(null);

    const fetchProductos = async () => {
      const db = getFirestore();
      const productosCollection = collection(db, 'productos');
      const querySnapshot = await getDocs(productosCollection);
      productos.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const editarProducto = (producto) => {
      productoSeleccionado.value = { ...producto };
    };

    const guardarCambios = async () => {
      const db = getFirestore();
      const productoDoc = doc(db, 'productos', productoSeleccionado.value.id);
      await updateDoc(productoDoc, productoSeleccionado.value);
      productoSeleccionado.value = null; // Limpiar la selección
      fetchProductos(); // Volver a cargar la lista
    };

    const eliminarProducto = async (id) => {
      const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
      if (confirmacion) {
        const db = getFirestore();
        const productoDoc = doc(db, 'productos', id);
        await deleteDoc(productoDoc);
        fetchProductos(); // Volver a cargar la lista
      } else {
        alert('Eliminación cancelada.');
      }
    };

    // Cargar productos al inicio
    fetchProductos();

    return {
      productos,
      productoSeleccionado,
      fetchProductos,
      editarProducto,
      guardarCambios,
      eliminarProducto,
    };
  },
};
</script>

<style scoped>
/* Estilos de la tabla y formulario */

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: antiquewhite;
}

th, td {
  border: 1px solid #858585;
  padding: 5px;
  text-align: left;
}

td {
  white-space: nowrap;
}

th {
  background-color: #FF9800;
}

button {
  display: inline-block;
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin: 3px;
}

button.editar {
  background-color: blue;
  color: white;
}

button.editar:hover {
  background-color: rgb(77, 77, 247);
}

button.eliminar {
  background-color: red;
  color: white;
}

button.eliminar:hover {
  background-color: rgb(250, 131, 131);
}

h1 {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

form {
  margin-top: 20px;
  border: 1.5px solid #ccc;
}

form button {
  background-color: blue;
  color: white;
}

form button:hover {
  background-color: rgb(77, 77, 247);
}
</style>
