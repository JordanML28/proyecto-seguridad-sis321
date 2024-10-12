<template>
  <div>
    <h1>Administrar Usuarios</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuarios" :key="usuario.id">
          <td>{{ usuario.id }}</td>
          <td>{{ usuario.nombre }}</td>
          <td>{{ usuario.correo }}</td>
          <td>{{ usuario.rol.join(', ') }}</td>
          <td>
            <button @click="editarUsuario(usuario)">Editar</button>
            <button @click="eliminarUsuario(usuario.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <form v-if="usuarioSeleccionado">
      <h2>Editar Usuario</h2>
      <label>Nombre:</label>
      <input v-model="usuarioSeleccionado.nombre" />
      <label>Email:</label>
      <input v-model="usuarioSeleccionado.correo" />
      <fieldset>
        <legend>Roles:</legend>
        <label v-for="rol in roles" :key="rol">
          <input type="checkbox" :value="rol" v-model="usuarioSeleccionado.rol" />
          {{ rol }}
        </label>
      </fieldset>
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
      usuarioSeleccionado.value = { ...usuario }; // Crear una copia para editar
    };

    const guardarCambios = async () => {
      if (!usuarioSeleccionado.value.rol || usuarioSeleccionado.value.rol.length === 0) {
        alert('Debes seleccionar al menos un rol.');
        return;
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
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

h1 {
  text-align: center;
}

form {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
}

fieldset {
  border: none; /* Sin borde */
  margin: 10px 0;
}
</style>
