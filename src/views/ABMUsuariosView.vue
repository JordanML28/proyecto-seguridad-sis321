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
            <th>Teléfono</th>
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
            <td>{{ usuario.correo }}</td>
            <td>{{ usuario.telefono }}</td>
            <td>
              <div v-for="rol in usuario.rol" :key="rol">
                <div class="rol">{{ mapRol(rol) }}</div>
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
              <th>Teléfono</th>
              <th>Roles</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ usuarioSeleccionado.id }}</td>
              <td><input v-model="usuarioSeleccionado.username" /></td>
              <td><input v-model="usuarioSeleccionado.nombre" /></td>
              <td><input v-model="usuarioSeleccionado.apellido" /></td>
              <td><input v-model="usuarioSeleccionado.segundoApellido" /></td>
              <td><input v-model="usuarioSeleccionado.correo" /></td>
              <td><input v-model="usuarioSeleccionado.telefono" /></td>
              <td>
                <fieldset>
                  <label v-for="rol in roles" :key="rol">
                    <input type="checkbox" :value="rol" v-model="usuarioSeleccionado.rol" />
                    {{ mapRol(rol) }}
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
import { signOut } from "firebase/auth";
import { auth } from "@/firebase"; // Configuración de Firebase
import { mapState, mapActions } from 'vuex';
export default {
  name: 'ABMUsuariosView',
  computed: {
    ...mapState(['isAuthenticated', 'user']),
    username() {
      return this.user?.username || '';
    },
    userInitials() {
      if (!this.username) return '';
      const names = this.username.split(' ');
      const initials = names[0].charAt(0) + (names[1] ? names[1].charAt(0) : '');
      return initials.toUpperCase();
    }
  },
  setup() {
    const usuarios = ref([]);
    const usuarioSeleccionado = ref(null);

    // Mapeo de roles internos a nombres visuales
    const rolesMap = {
      'Usuario': 'Usuario',
      'Admin_ABM_Usuarios': 'Administrador de Usuarios',
      'Admin_ABM_Inventario': 'Administrador de Inventario',
      'Admin_Ventas': 'Jefe de Ventas',
      'Contador': 'Contador',
      'Auditor': 'Auditor'
     
    };

    const roles = ['Usuario','Admin_ABM_Usuarios', 'Admin_ABM_Inventario','Admin_Ventas', 'Contador', 'Auditor'];

    // Función para mapear el rol a un valor visual
    const mapRol = (rol) => {
      return rolesMap[rol] || rol; // Retorna el nombre visual, o el rol original si no está en el mapa
    };

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

      // Refresca la página
      window.location.reload();
    };

    const eliminarUsuario = async (id) => {
      const confirmacion = confirm('¿Estás seguro de que deseas eliminar este usuario?');
      if (confirmacion) {
        const db = getFirestore();
        const usuarioDoc = doc(db, 'users', id);
        await deleteDoc(usuarioDoc);
        fetchUsuarios(); // Volver a cargar la lista
      } else {
        alert('Eliminación cancelada.');
      }
    };

    // Cargar usuarios al inicio
    fetchUsuarios();

    return {
      usuarios,
      usuarioSeleccionado,
      roles,
      mapRol,
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
  background-color:antiquewhite;
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
.rol{
  text-align: center;
  margin: 5px;
  color: aliceblue;
  padding: 3px;
  background: #1eb039;
  border: 2px solid #858585;
  border-radius: 10px;
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
form button{
  background-color: blue;
  color: white;
}

form button:hover{
  background-color: rgb(77, 77, 247);
  color: white;
}
fieldset {
  border: none;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
}
</style>
