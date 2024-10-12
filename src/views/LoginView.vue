<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>Iniciar Sesión</h2>
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <input type="submit" value="Iniciar Sesión" />
      <div class="signup-link">
        <router-link to="/signup">Crear Cuenta</router-link>
      </div>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>


<script>
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { mapActions } from 'vuex'; // Importa mapActions
import { onMounted } from 'vue';

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    ...mapActions(['login']), // Mapea la acción de login

    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    },

    async handleLogin() {
      const db = getFirestore(); // Obtiene la instancia de Firestore
      this.errorMessage = ""; // Reinicia el mensaje de error

      try {
        const hashedPassword = await this.sha256(this.password); // Hashea la contraseña ingresada

        // Realiza la consulta a Firestore para encontrar al usuario por su correo
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("correo", "==", this.email)); // Cambia "email" por "correo"
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          this.errorMessage = "No se encontró un usuario con ese correo electrónico.";
          return;
        }

        let userDoc;
        snapshot.forEach(doc => {
          userDoc = { id: doc.id, ...doc.data() }; // Obtén el documento del usuario
        });

        // Comparar la contraseña hasheada
        if (userDoc.contrasena === hashedPassword) { // Cambia "password" por "contrasena"
          console.log("Inicio de sesión exitoso:", userDoc);
          this.login(userDoc); // Llama a la acción de Vuex
          localStorage.setItem('user', JSON.stringify({ id: userDoc.id, email: userDoc.correo })); // Guarda el usuario en localStorage
          this.$router.push('/'); 
        } else {
          this.errorMessage = "Contraseña incorrecta.";
        }
      } catch (error) {
        this.errorMessage = "Error al iniciar sesión: " + error.message; // Mostrar error
        console.error("Error al iniciar sesión:", error);
      }
    },

    checkUserSession() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        // Si existe un usuario en localStorage, puedes establecerlo en Vuex o en tu estado
        this.login(user);
        this.$router.push('/'); // Redirige a la página principal
      }
    }
  },
  onMounted() {
    this.checkUserSession(); // Verifica la sesión al cargar el componente
  }
};
</script>

<style scoped>
.login-container {
  width: 50%;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

form {
  display: flex;
  flex-direction: column; /* Organiza los elementos en columna */
  gap: 15px; /* Espacio entre los elementos */
  padding: 20px;
  background-color: #8BC34A;
  border: 3px solid #FF9800;
  border-radius: 5px;
}

h2 {
  text-align: center; /* Centra el título */
}

.form-group {
  display: flex;
  flex-direction: column; /* Organiza la etiqueta y el input en columna */
}

label {
  margin-bottom: 5px; /* Espacio entre la etiqueta y el input */
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px; /* Mejora el espaciado interno */
  border: 1px solid #ccc; /* Añade un borde ligero */
  border-radius: 4px; /* Mejora el estilo del input */
}

input[type="submit"] {
  padding: 10px;
  background-color: #FF9800;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px; /* Añade bordes redondeados al botón */
}

input[type="submit"]:hover {
  background-color: #F57C00; /* Cambia el color en hover */
}

.signup-link {
  text-align: center; /* Centra el enlace para crear cuenta */
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center; /* Centra el mensaje de error */
}
</style>
