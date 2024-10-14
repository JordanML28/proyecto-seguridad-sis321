<template>
  <nav>
    <h1>Libreria UCB</h1>
    <img src="https://tja.ucb.edu.bo/wp-content/uploads/2020/09/cropped-logo-UCB.png" alt="Logo" />
    <ul>
      <li><router-link to="/">Inicio</router-link></li>
      <!-- Mostrar el nombre del usuario autenticado -->
      <li v-if="isAuthenticated">
        <div class="avatar">
          <span>{{ userInitials }}</span>
        </div>
        Bienvenido: {{ username }}
      </li>
      <li v-if="isAuthenticated && tieneRol('Usuario') || tieneRol('Contador') || tieneRol('Auditor')">
        <router-link to="/Catalogo">Catalogo</router-link>
      </li>
      <!-- Mostrar el link para iniciar sesión si no está autenticado -->
      <li v-if="!isAuthenticated">
        <router-link to="/login">Iniciar Sesión</router-link>
      </li>
      <!-- Mostrar el link para ABM Usuarios si tiene el rol Admin_ABM_Usuarios -->
      <li v-if="isAuthenticated && tieneRol('Admin_ABM_Usuarios')">
        <router-link to="/abmusuarios">Administrar Usuarios</router-link>
      </li>
      <!-- Mostrar el link para ABM Inventario si tiene el rol Admin_ABM_Inventario -->
      <li v-if="isAuthenticated && tieneRol('Admin_ABM_Inventario'|| tieneRol('Auditor'))">
        <router-link to="/abminventario">Administrar Inventario</router-link>
      </li>
      <li v-if="isAuthenticated && tieneRol('Admin_Ventas')">
        <router-link to="/ventas">Ventas</router-link>
      </li>
      <li v-if="isAuthenticated && tieneRol('Contador') || tieneRol('Auditor')">
        <router-link to="/reportes">Reportes</router-link>
      </li>
      <!-- Mostrar el botón de cerrar sesión si el usuario está autenticado -->
      <li v-if="isAuthenticated" class="logout-container">
        <button @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { signOut } from "firebase/auth";
import { auth } from "@/firebase"; // Configuración de Firebase
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { mapState, mapActions } from 'vuex';

export default {
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
  created() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          this.login(userDoc.data());
        }
      } else {
        this.logout();
      }
    });
  },
  methods: {
    ...mapActions(['login', 'logout']),
    async handleLogout() {
      try {
        await signOut(auth);
        this.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    },
    /**
     * Verifica si el usuario tiene un rol específico.
     * @param {String} rol - El rol a verificar.
     * @returns {Boolean} - Devuelve true si el usuario tiene el rol, false en caso contrario.
     */
    tieneRol(rol) {
      return this.user?.rol && this.user.rol.includes(rol);
    }
  }
};
</script>

<style scoped>
/* Estilos de la barra de navegación */
nav {
  display: flex;
  background-color: #333;
  color: white;
  padding: 10px 0;
  width: 100%;  
  justify-content: center;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  margin-left: 5px; 
  background-color: #FF9800;
  border-radius: 15px;
  padding: 6px;
}

nav a:hover {
  background-color: rgb(13, 172, 16);
}

ul {
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

li {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333; 
  padding: 5px;
  border-radius: 5px;
}

img {
  width: 6%;
  height: auto;
}

button {
  width: 100%;
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 16px;
}

button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  text-decoration: none;
  border-radius: 5px;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: rgb(255, 136, 0);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}
</style>
