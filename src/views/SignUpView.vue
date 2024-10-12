<template>
  <div class="signup-container">
    <h1>Crear Usuario</h1>
    <form @submit.prevent="signUp">
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input v-model="nombre" type="text" id="nombre" required />
      </div>
      <div class="form-group">
        <label for="apellido1">Primer Apellido</label>
        <input v-model="apellido1" type="text" id="apellido1" required />
      </div>
      <div class="form-group">
        <label for="apellido2">Segundo Apellido</label>
        <input v-model="apellido2" type="text" id="apellido2" required />
      </div>
      <div class="form-group">
        <label for="telefono">Teléfono</label>
        <input v-model="telefono" type="text" id="telefono" required />
      </div>
      <div class="form-group">
        <label for="correo">Correo Electrónico (parte local)</label>
        <div class="email-input">
          <input v-model="correo" type="text" id="correo" required />
          <span class="email-extension">@ucb.edu.bo</span>
        </div>
      </div>
      <div class="form-group">
        <label for="contrasena">Contraseña</label>
        <input v-model="contrasena" type="password" id="contrasena" required />
      </div>
      <button type="submit">Registrarse</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { generateUsername } from "@/utils/username"; // Asegúrate de que la ruta sea correcta

export default {
  data() {
    return {
      nombre: "",
      apellido1: "",
      apellido2: "",
      telefono: "",
      correo: "",
      contrasena: "",
      errorMessage: "",
    };
  },
  methods: {
    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    },

    async signUp() {
      const auth = getAuth();
      const db = getFirestore();
      this.errorMessage = ""; // Reinicia el mensaje de error al inicio del registro

      const fullEmail = `${this.correo}@ucb.edu.bo`; // Concatenar el dominio al correo ingresado

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, this.contrasena);
        const user = userCredential.user;

        // Cifrar la contraseña
        const hashedPassword = await this.sha256(this.contrasena); // Usa await aquí

        // Generar el nombre de usuario
        const username = generateUsername(this.nombre, this.apellido1, this.apellido2, this.telefono);

        // Crear un objeto de datos del usuario
        const userData = {
          nombre: this.nombre,
          apellido: this.apellido1,
          segundoApellido: this.apellido2,
          telefono: this.telefono,
          correo: fullEmail,
          contrasena: hashedPassword,
          rol: ["usuario"],
          username: username
        };

        // Guardar los datos en Firestore bajo la colección 'users'
        await setDoc(doc(db, "users", user.uid), userData);

        // Redirigir al login
        this.$router.push("/login");

      } catch (error) {
        // Manejo de errores
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = "El correo electrónico ya está en uso. Por favor, intenta con otro.";
        } else {
          this.errorMessage = "Error al crear el usuario: " + error.message;
        }
        console.error("Error al crear el usuario:", error.message);
      }
    }
  }
};
</script>

<style scoped>
.signup-container {
  width: 50%;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #8BC34A;
  border: 3px solid #FF9800;
}

h1 {
  text-align: center; /* Centra el título */
}

.form-group {
  margin-bottom: 15px; /* Espacio entre los grupos de formulario */
}

label {
  display: block; /* Hace que la etiqueta ocupe toda la línea */
  margin-bottom: 5px; /* Espacio entre la etiqueta y el campo */
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px; /* Bordes redondeados */
}

.email-input {
  display: flex;
  align-items: center; /* Centra verticalmente el contenido */
}

.email-extension {
  margin-left: 10px; /* Espacio entre el campo y la extensión */
  font-weight: bold; /* Para destacar la extensión */
}

button {
  width: 100%;
  padding: 10px;
  background-color: #FF9800;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px; /* Bordes redondeados */
}

button:hover {
  background-color: #F57C00;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
