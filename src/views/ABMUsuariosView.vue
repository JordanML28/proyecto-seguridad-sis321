<template>
  <div>
    <h1>Administrar Usuarios</h1>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Segundo Apellido</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.id }}</td>
            <td>{{ usuario.username }}</td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.apellido }}</td>
            <td>{{ usuario.segundoApellido }}</td>
            <td>{{ usuario.telefono }}</td>
            <td>{{ usuario.correo }}</td>
            <td>
              <div v-for="rol in usuario.rol" :key="rol">
                {{ rol }}
              </div>
            </td>
            <td>{{ usuario.estado }}</td>
            <td>
              <button class="editar" @click="editarUsuario(usuario)">Editar</button>
              <button class="eliminar" @click="eliminarUsuario(usuario.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <form v-if="usuarioSeleccionado">
      <h1>Editar Usuario</h1>
      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Segundo Apellido</th>
              <th>Correo</th>
              <th>Telefono</th>
              <th>Roles</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ usuarioSeleccionado.id }}</td>
              <td>{{ usuarioSeleccionado.username }}</td>
              <td><input v-model="usuarioSeleccionado.nombre" /></td>
              <td><input v-model="usuarioSeleccionado.apellido" /></td>
              <td><input v-model="usuarioSeleccionado.segundoApellido" /></td>
              <td><input v-model="usuarioSeleccionado.correo" /></td>
              <td><input v-model="usuarioSeleccionado.telefono" /></td>
              <td>
                <fieldset>
                  <label v-for="rol in roles" :key="rol">
                    <input type="checkbox" :value="rol" v-model="usuarioSeleccionado.rol" />
                    {{ rol }}
                  </label>
                </fieldset>
              </td>
              <td>
                <fieldset>
                  <label>
                    <input type="radio" value="Desbloqueado" v-model="usuarioSeleccionado.estado" />
                    Desbloqueado
                  </label>
                  <label>
                    <input type="radio" value="Bloqueado" v-model="usuarioSeleccionado.estado" />
                    Bloqueado
                  </label>
                </fieldset>
              </td>
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
  name: 'ABMUsuariosView',
  setup() {
    const usuarios = ref([]);
    const usuarioSeleccionado = ref(null);
    const roles = ['usuario', 'Admin_ABM_Usuarios', 'Admin_ABM_Inventario', 'Admin_Ventas', 'Admin_Reportes'];
    
    const fetchUsuarios = async () => {
      const db = getFirestore();
      const usuariosCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usuariosCollection);
      usuarios.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const editarUsuario = (usuario) => {
      usuarioSeleccionado.value = { 
        ...usuario,
        estado: usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1).toLowerCase(), // Normaliza el estado a "Desbloqueado" o "Bloqueado"
      };
    };

    const guardarCambios = async () => {
      if (!usuarioSeleccionado.value.rol || usuarioSeleccionado.value.rol.length === 0) {
        alert('Debes seleccionar al menos un rol.');
        return;
      }

      // Verifica si el estado ha cambiado de "Bloqueado" a "Desbloqueado"
      if (usuarioSeleccionado.value.estado === "Desbloqueado") {
        usuarioSeleccionado.value.intentos = 0; // Resetea los intentos a 0
      }

      const db = getFirestore();
      const usuarioDoc = doc(db, 'users', usuarioSeleccionado.value.id);
      await updateDoc(usuarioDoc, usuarioSeleccionado.value);
      usuarioSeleccionado.value = null; // Limpiar la selección
      fetchUsuarios(); // Volver a cargar la lista
    };

    const eliminarUsuario = async (id) => {
      const db = getFirestore();
      const usuarioDoc = doc(db, 'users', id);
      await deleteDoc(usuarioDoc);
      fetchUsuarios(); // Volver a cargar la lista
    };

    // Cargar usuarios al inicio
    fetchUsuarios();

    return {
      usuarios,
      usuarioSeleccionado,
      roles,
      fetchUsuarios,
      editarUsuario,
      guardarCambios,
      eliminarUsuario,
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

fieldset {
  border: none;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
}
</style>
