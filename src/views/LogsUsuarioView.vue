<template>
  <div>
    <h1>Logs de Intentos de Inicio de Sesión</h1>
    <div>
      <!-- Botones para ordenar por fecha -->
      <button @click="ordenarDescendente">Ordenar por Fecha (Ascendente)</button>
      <button @click="ordenarAscendente">Ordenar por Fecha (Descendente)</button>
    </div>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>IP</th>
            <th>Fecha</th>
            <th>Correo</th>
            <th>Resultado</th>
            <th>Mensaje</th> <!-- Nueva columna -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>{{ log.ip || 'No registrada' }}</td>   
            <td>{{ new Date(log.fecha).toLocaleString() }}</td>
            <td>{{ log.correo }}</td>
            <td>{{ log.resultado }}</td>
            <td>{{ log.mensaje || 'Sin mensaje' }}</td> <!-- Mostrar mensaje o predeterminado -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default {
  name: "LogsUsuario",
  setup() {
    const logs = ref([]);

    const fetchLogs = async () => {
      const db = getFirestore();
      const logsRef = collection(db, "logsUsuario");
      const querySnapshot = await getDocs(logsRef);
      
      // Obtener los logs desde la base de datos
      logs.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar los logs por la fecha en orden descendente al cargar
      ordenarDescendente();
    };

    // Ordenar los logs por la fecha en orden descendente
    const ordenarDescendente = () => {
      logs.value.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB - dateA; // Orden descendente
      });
    };

    // Ordenar los logs por la fecha en orden ascendente
    const ordenarAscendente = () => {
      logs.value.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA - dateB; // Orden ascendente
      });
    };

    onMounted(fetchLogs); // Cargar los logs al montar el componente

    return {
      logs,
      ordenarAscendente,
      ordenarDescendente,
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
  white-space: nowrap; /* Esto evita que los botones se envuelvan en varias líneas */
}
th {
  background-color: #FF9800;
}
button {
  display: inline-block; /* Hace que los botones se muestren en la misma línea */
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin: 3px;
  background-color: #FF9800;
  color: white;
}

button:hover {
  background-color: #1eb039;
}

form {
  margin-top: 20px;
}

fieldset {
  display: flex;
  flex-direction: column;
}

input[type="checkbox"],
input[type="radio"] {
  margin-right: 10px;
}
h1 {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
