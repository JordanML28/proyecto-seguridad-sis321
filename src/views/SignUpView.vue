<template>
  <div class="signup-container">
    <h1>Crear Usuario</h1>
    <form @submit.prevent="signUp">
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input 
          v-model="nombre" 
          type="text" 
          id="nombre" 
          required 
          @input="validateLetters('nombre')" 
        />
      </div>
      <div class="form-group">
        <label for="apellido1">Primer Apellido</label>
        <input 
          v-model="apellido1" 
          type="text" 
          id="apellido1" 
          required 
          @input="validateLetters('apellido1')" 
        />
      </div>
      <div class="form-group">
        <label for="apellido2">Segundo Apellido</label>
        <input 
          v-model="apellido2" 
          type="text" 
          id="apellido2" 
          required 
          @input="validateLetters('apellido2')" 
        />
      </div>
      <div class="form-group">
        <label for="telefono">Teléfono</label>
        <input v-model="telefono" type="text" id="telefono" maxlength="8" @input="validatePhone" required />
        <small v-if="telefonoError" class="error">{{ telefonoError }}</small>
      </div>
      <div class="form-group">
        <label for="correo">Correo Electrónico (parte local)</label>
        <div class="email-input">
          <input 
            v-model="correo" 
            type="text" 
            id="correo" 
            @keydown="preventAtSymbol" 
            @paste="preventPaste" 
            autocomplete="new-password" 
            required 
          />
          <span class="email-extension">@ucb.edu.bo</span>
        </div>
        <small v-if="correoError" class="error">{{ correoError }}</small>
      </div>
      <div class="form-group">
        <label for="contrasena">Contraseña</label>
        <div class="password-input">
          <input :type="showPassword ? 'text' : 'password'" v-model="contrasena" id="contrasena" @input="validatePassword" required />
          <button type="button" class="toggle-password" @mousedown="togglePasswordVisibility" @mouseup="resetTogglePasswordVisibility">{{ showPassword ? 'Ocultar' : 'Mostrar' }}</button>
        </div>
        <small v-if="passwordError" class="error">{{ passwordError }}</small>
        <div class="checklist">
          <p v-bind:class="{ 'valid': passwordLengthValid }">✔ Al menos 12 caracteres</p>
          <p v-bind:class="{ 'valid': hasUpperCase }">✔ Una letra mayúscula</p>
          <p v-bind:class="{ 'valid': hasLowerCase }">✔ Una letra minúscula</p>
          <p v-bind:class="{ 'valid': hasSpecialChar }">✔ Un carácter especial ($)</p>
          <p v-bind:class="{ 'valid': hasNumber }">✔ Al menos un número</p>
        </div>
      </div>
      <div class="form-group">
        <label for="confirmarContrasena">Confirmar Contraseña</label>
        <div class="password-input">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmarContrasena" id="confirmarContrasena" required />
          <button type="button" class="toggle-password" @mousedown="toggleConfirmPasswordVisibility" @mouseup="resetToggleConfirmPasswordVisibility">{{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}</button>
        </div>
        <small v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</small>
      </div>
      <button type="submit">Registrarse</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { generateUsername } from "@/utils/username"; // Asegúrate de que este archivo exista y sea accesible.

export default {
  data() {
    return {
      nombre: "",
      apellido1: "",
      apellido2: "",
      telefono: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
      errorMessage: "",
      telefonoError: "",
      passwordError: "",
      confirmPasswordError: "",
      passwordLengthValid: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasSpecialChar: false,
      showPassword: false,
      showConfirmPassword: false,
      emailError: "",
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
    validateLetters(field) {
      const regex = /^[A-Za-záéíóúÁÉÍÓÚÑñ ]+$/;
      if (field === 'nombre' && !regex.test(this.nombre)) {
        this.nombre = this.nombre.replace(/[^A-Za-záéíóúÁÉÍÓÚÑñ ]+/g, ''); // Limpiar si hay caracteres no permitidos
      } else if (field === 'apellido1' && !regex.test(this.apellido1)) {
        this.apellido1 = this.apellido1.replace(/[^A-Za-záéíóúÁÉÍÓÚÑñ ]+/g, '');
      } else if (field === 'apellido2' && !regex.test(this.apellido2)) {
        this.apellido2 = this.apellido2.replace(/[^A-Za-záéíóúÁÉÍÓÚÑñ ]+/g, '');
      }
    },
    async emailExistsInFirestore(email) {
      const db = getFirestore();
      const usersRef = collection(db, "users"); 
      console.log(email); // Aquí se asegura de obtener la colección "users"
      const q = query(usersRef, where("correo", "==", email)); // Consulta para verificar si el correo ya existe
      const querySnapshot = await getDocs(q); // Obtener los resultados de la consulta
      return !querySnapshot.empty; // Retorna true si el correo ya existe
    },
    validatePhone() {
      const phoneRegex = /^[67][0-9]{7}$/;
      if (!phoneRegex.test(this.telefono)) {
        this.telefonoError = "El número debe comenzar con 6 o 7 y tener 8 dígitos.";
      } else {
        this.telefonoError = "";
      }

      if (this.telefono.length > 0 && !/^[67]/.test(this.telefono)) {
        this.telefono = ""; // Limpiar el campo si no comienza con 6 o 7
      }
    },
    validateEmail(){
      if (this.correo.includes('@')) {
        this.emailError = "No se puede ingresar '@' porque ya hay una extensión predeterminada.";
      } else {
        this.emailError = "";
      }
    },
    preventAtSymbol(event) {
      if (event.key === '@') {
        event.preventDefault();
        this.correoError = "No se puede ingresar '@' ya que la extensión es predeterminada.";
      } else {
        this.correoError = ""; // Limpiar el error si se ingresa otro carácter
      }
    },
    preventPaste(event) {
      // Obtener el texto que se va a pegar
      const pasteData = event.clipboardData.getData('text');
      
      // Si contiene '@', prevenir el pegado
      if (pasteData.includes('@')) {
        event.preventDefault();
        this.correoError = "No se puede pegar un correo con '@' ya que la extensión es predeterminada.";
      } else {
        this.correoError = ""; // Limpiar el error si el texto pegado es válido
      }
    },
    validatePassword() {
      this.passwordLengthValid = this.contrasena.length >= 12;
      this.hasUpperCase = /[A-Z]/.test(this.contrasena);
      this.hasLowerCase = /[a-z]/.test(this.contrasena);
      this.hasSpecialChar = /[$]/.test(this.contrasena);
      this.hasNumber = /\d/.test(this.contrasena);
      if (this.contrasena.length < 12) {
        this.passwordError = "La contraseña debe tener al menos 12 caracteres.";
      } else if (!this.hasUpperCase || !this.hasLowerCase || !this.hasSpecialChar || !this.hasNumber) {
        this.passwordError = "La contraseña debe cumplir con los requisitos.";
      } else {
        this.passwordError = "";
      }

      if (this.confirmarContrasena && this.contrasena !== this.confirmarContrasena) {
        this.confirmPasswordError = "Las contraseñas no coinciden.";
      } else {
        this.confirmPasswordError = "";
      }
    },
    togglePasswordVisibility() {
      this.showPassword = true;
    },
    resetTogglePasswordVisibility() {
      this.showPassword = false;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = true;
    },
    resetToggleConfirmPasswordVisibility() {
      this.showConfirmPassword = false;
    },
    async signUp() {
      const auth = getAuth();
      const db = getFirestore();
      this.errorMessage = "";

      const fullEmail = `${this.correo.trim().toLowerCase()}@ucb.edu.bo`;
      console.log("FullEmail: ",fullEmail)

      this.validatePhone();
      this.validatePassword();

      if (this.telefonoError || this.passwordError || this.confirmPasswordError) {
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, this.contrasena);
        const user = userCredential.user;
        console.log(userCredential);
        console.log(user);
        const emailInUse = await this.emailExistsInFirestore(fullEmail);
        if (emailInUse) {
          this.errorMessage = "Este correo electrónico ya está registrado en la base de datos.";
          return;
        }

        const hashedPassword = await this.sha256(this.contrasena);
        const username = generateUsername(this.nombre, this.apellido1, this.apellido2, this.telefono);

        const userData = {
          nombre: this.nombre,
          apellido: this.apellido1,
          segundoApellido: this.apellido2,
          telefono: this.telefono,
          correo: fullEmail,
          contrasena: hashedPassword,
          intentos: 0,
          estado:"Desbloqueado",
          rol: ["Usuario"],
          username: username,
        };

        await setDoc(doc(db, "users", user.uid), userData);
        alert("Usuario creado con éxito.");
        this.$store.dispatch('auth/CLEAR_USER');
        this.$router.push("/");
      } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            this.errorMessage = `El correo electrónico ${fullEmail} ya está en uso.`;
          } else {
            this.errorMessage = "Error al crear el usuario: " + error.message;
          }
          console.error("Error al crear el usuario:", error.message);
        }
    },
  },
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
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.password-input {
  display: flex;
  align-items: center;
}

.toggle-password {
  margin-left: 5px;
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px;
  color: aliceblue;
  background-color: #FF9800;
  border: 3px solid #FF9800;
  font-weight: bold;
}
.toggle-password:hover{
  background-color: rgb(231, 220, 24);
  border: 3px solid rgb(231, 220, 24);
}
.error {
  color: red;
  font-size: 0.875em;
}

.checklist {
  margin-top: 10px;
}

.checklist p {
  margin: 5px 0;
}

.checklist p.valid {
  color: green;
}

.email-input {
  display: flex;
  align-items: center;
}

.email-extension {
  margin-left: 5px;
  font-weight: bold;
}
button{
  font-size: 16px;
  padding: 5px;
  color: aliceblue;
  background-color: #FF9800;
  border: 3px solid #FF9800;
  font-weight: bold;
  cursor: pointer;
}
button:hover{
  border: 3px solid rgb(231, 220, 24);
  background-color: rgb(231, 220, 24);
}
</style>
