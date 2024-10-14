<template>
  <div>
    <h1>Ventas Realizadas</h1>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Cantidades</th>
            <th>Precios</th>
            <th>Productos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventas" :key="venta.id">
            <td>{{ venta.usuario }}</td>
            <td>
              <table>
                <tr v-for="(producto, index) in venta.productos" :key="index">
                  <td>{{ producto }}</td>
                </tr>
              </table>
              
            </td>
            <td>
              <table>
                <tr v-for="(cantidad, index) in venta.cantidad" :key="index">
                  <td>{{ cantidad }}</td>
                </tr>
              </table>
            </td>
            <td>
              <table>
                <tr v-for="(precio, index) in venta.precio" :key="index">
                  <td>{{ precio }}</td>
                </tr>
              </table>
            </td>
            <td>{{ calcularTotal(venta.cantidad, venta.precio) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
  name: 'VentasView',
  setup() {
    const ventas = ref([]);
    const fetchVentas = async () => {
      const db = getFirestore();
      const ventasCollection = collection(db, 'ventas');
      const querySnapshot = await getDocs(ventasCollection);
      ventas.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const calcularTotal = (cantidades, precios) => {
      return cantidades.reduce((total, cantidad, index) => {
        return total + (cantidad * precios[index]);
      }, 0);
    };

    fetchVentas();

    return {
      ventas,
      calcularTotal
    };
  }
};
</script>

<style scoped>
/* Estilos de la tabla */
.tabla-contenedor {
  overflow-x: auto;
}

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: antiquewhite;
}

th, tr{
  border: 1px solid #858585;
  padding: 5px;
  text-align: left;
}
td{
    border: 1.5px solid #858585;
    padding: 5px;
}
td {
  white-space: nowrap;
}

th {
  background-color: #FF9800;
}
h1 {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>
