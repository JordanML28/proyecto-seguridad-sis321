// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticación
import { getFirestore } from "firebase/firestore"; // Para Firestore (base de datos)
import { addDoc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiu4G_ZBLngk7w0-TwifuoEiOcifF7uEM",
  authDomain: "proyecto-seguridad-sis321.firebaseapp.com",
  projectId: "proyecto-seguridad-sis321",
  storageBucket: "proyecto-seguridad-sis321.appspot.com",
  messagingSenderId: "575155398596",
  appId: "1:575155398596:web:45df0c413e61be75f6a691"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializa la autenticación
const db = getFirestore(app); // Inicializa Firestore

export { auth, db};
