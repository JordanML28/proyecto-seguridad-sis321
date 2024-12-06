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

import { getFirestore, collection, getDocs, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { mapState,mapActions } from 'vuex';
import { onMounted } from 'vue';

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      attempts: 0,
       userIP: null,
    };
  },
  computed: {
    ...mapState(['user']), // Accede al usuario desde Vuex
  },
  methods: {
    ...mapActions(['login', 'logout']),// Mapea la acción de login

    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    },
    async getClientIP() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        this.userIP = data.ip; // Guarda la IP en data
      } catch (error) {
        console.error("Error al obtener la IP:", error);
        this.userIP = "IP no disponible"; // Valor por defecto en caso de error
      }
    },

    async handleLogin() {
      const db = getFirestore();
      this.errorMessage = "";

      await this.getClientIP(); // Obtén la IP del usuario

      try {
        const hashedPassword = await this.sha256(this.password);

        // Consulta en Firestore para verificar el usuario
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("correo", "==", this.email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          this.errorMessage = "No se encontró un usuario con ese correo.";
          await this.logAttempt("Fallido: Usuario no encontrado", "Correo inexistente.");
          return;
        }

        let userDoc;
        snapshot.forEach(doc => {
          userDoc = { id: doc.id, ...doc.data() };
        });

        if (userDoc.estado === "Bloqueado") {
          this.errorMessage = "Tu cuenta está bloqueada. Contacta al administrador.";
          await this.logAttempt("Fallido: Cuenta bloqueada", "Intento con cuenta bloqueada.");
          return;
        }

        if (userDoc.contrasena === hashedPassword) {
          await updateDoc(doc(db, "users", userDoc.id), { intentos: 0 });
          await this.logAttempt("Inicio: Exitoso", "Inicio exitoso.");
          this.login(userDoc); // Establece el estado Vuex
          localStorage.setItem('user', JSON.stringify({ id: userDoc.id, email: userDoc.correo }));
          this.$router.push('/');
        } else {
          this.attempts = userDoc.intentos + 1;

          if (this.attempts >= 3) {
            await updateDoc(doc(db, "users", userDoc.id), {
              intentos: this.attempts,
              estado: "Bloqueado",
            });
            this.errorMessage = "Contraseña incorrecta. Tu cuenta ha sido bloqueada.";
            await this.logAttempt("Fallido: Cuenta bloqueada", "Demasiados intentos.");
          } else {
            await updateDoc(doc(db, "users", userDoc.id), { intentos: this.attempts });
            this.errorMessage = `Correo o contraseña incorrectos (${this.attempts}/3).`;
            await this.logAttempt(`Fallido: Intento ${this.attempts}/3`, "Intento fallido.");
          }
        }
      } catch (error) {
        this.errorMessage = "Error al iniciar sesión: " + error.message;
        console.error("Error al iniciar sesión:", error);
      }
    },

    async logAttempt(result, message = null) {
      const db = getFirestore();
      const logsRef = collection(db, "logsUsuario");
      await addDoc(logsRef, {
        correo: this.email,
        fecha: new Date().toISOString(),
        resultado: result,
        ip: this.userIP,
        mensaje: message, // Guardar el mensaje en el log
      });
    },
    checkUserSession() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        this.login(user);
        this.$router.push('/');
      }
    }
  },
  onMounted() {
    this.checkUserSession();
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
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #8BC34A;
  border: 3px solid #FF9800;
  border-radius: 5px;
}

h2 {
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="submit"] {
  padding: 10px;
  background-color: #FF9800;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

input[type="submit"]:hover {
  background-color: #F57C00;
}

.signup-link {
  text-align: center;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>
