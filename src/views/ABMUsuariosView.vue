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
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { mapState } from 'vuex';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  computed: {
    ...mapState(['isAuthenticated', 'user']),
  },
  name: 'ABMUsuariosView',
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const usuarios = ref([]);
    const usuarioSeleccionado = ref(null);
    const direccionIP = ref('');

    // Mapeo de roles
    const rolesMap = {
      Usuario: 'Usuario',
      Admin_ABM_Usuarios: 'Administrador de Usuarios',
      Admin_ABM_Inventario: 'Administrador de Inventario',
      Admin_Ventas: 'Jefe de Ventas',
      Contador: 'Contador',
      Auditor: 'Auditor',
    };

    const roles = Object.keys(rolesMap);

    // Función para obtener la IP pública
    const obtenerIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        direccionIP.value = data.ip;
      } catch (error) {
        console.error('Error al obtener la dirección IP:', error);
        direccionIP.value = 'Desconocida';
      }
    };

    // Función para cargar usuarios
    const fetchUsuarios = async () => {
      const db = getFirestore();
      const usuariosCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usuariosCollection);
      usuarios.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    // Editar usuario
    const editarUsuario = (usuario) => {
      usuarioSeleccionado.value = {
        ...usuario,
        estado: usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1).toLowerCase(), // Normaliza el estado
      };
    };

    // Guardar cambios
    const guardarCambios = async () => {
      const correo = user.value?.correo;
      if (!usuarioSeleccionado.value.rol || usuarioSeleccionado.value.rol.length === 0) {
        alert('Debes seleccionar al menos un rol.');
        return;
      }

      if (usuarioSeleccionado.value.estado === 'Desbloqueado') {
        usuarioSeleccionado.value.intentos = 0; // Resetea los intentos
      }

      const db = getFirestore();
      const usuarioDoc = doc(db, 'users', usuarioSeleccionado.value.id);

      const usuarioOriginal = usuarios.value.find((u) => u.id === usuarioSeleccionado.value.id);
      const cambios = Object.keys(usuarioSeleccionado.value).reduce((acc, key) => {
        if (usuarioSeleccionado.value[key] !== usuarioOriginal[key]) {
          acc[key] = { antes: usuarioOriginal[key], despues: usuarioSeleccionado.value[key] };
        }
        return acc;
      }, {});

      try {
        await updateDoc(usuarioDoc, usuarioSeleccionado.value);

        const logData = {
          id: `${Date.now()}-${usuarioSeleccionado.value.id}`,
          direccionIP: direccionIP.value,
          fecha: new Date().toISOString(),
          correo,
          resultado: `Usuario editado: ${usuarioSeleccionado.value.id}`,
          mensaje: `Campos modificados: ${JSON.stringify(cambios)}`,
        };

        const logsCollection = collection(db, 'logsAplicacion');
        await setDoc(doc(logsCollection, logData.id), logData);

        usuarioSeleccionado.value = null;
        fetchUsuarios();
      } catch (error) {
        console.error('Error al guardar los cambios:', error);
      }
    };

    // Eliminar usuario
    const eliminarUsuario = async (id) => {
      const confirmacion = confirm('¿Estás seguro de que deseas eliminar este usuario?');
      const correo = user.value?.correo;

      if (confirmacion) {
        const db = getFirestore();
        const usuarioDoc = doc(db, 'users', id);

        try {
          await deleteDoc(usuarioDoc);

          const log = {
            id: `${Date.now()}_${id}`,
            direccionIP: direccionIP.value,
            fecha: new Date().toISOString(),
            correo,
            resultado: `Usuario eliminado: ${id}`,
            mensaje: `El usuario con ID ${id} ha sido eliminado.`,
          };

          const logRef = collection(db, 'logsAplicacion');
          await setDoc(doc(logRef, log.id), log);

          fetchUsuarios();
        } catch (error) {
          console.error('Error al eliminar el usuario:', error);
        }
      } else {
        alert('Eliminación cancelada.');
      }
    };

    // Llamar a obtenerIP y cargar usuarios al inicio
    obtenerIP();
    fetchUsuarios();

    return {
      usuarios,
      usuarioSeleccionado,
      roles,
      mapRol: (rol) => rolesMap[rol] || rol,
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
.rol {
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
  background-color: darkblue;
}

button.eliminar {
  background-color: red;
  color: white;
}

button.eliminar:hover {
  background-color: darkred;
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
