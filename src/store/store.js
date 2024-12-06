// src/store/store.js
import { createStore } from 'vuex';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase

export default createStore({
  state: {
    user: null, // Aquí se almacenará toda la información del usuario
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user; // Guarda el objeto completo del usuario
      state.isAuthenticated = true;
    },
    CLEAR_USER(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  actions: {
    login({ commit }, user) {
      commit('SET_USER', user); // Guarda todos los datos del usuario en Vuex
    },
    logout({ commit }) {
      commit('CLEAR_USER');
      signOut(auth); // Asegúrate de cerrar la sesión en Firebase
    },
  },
  getters: {
    getUser: (state) => state.user,
    getCorreo: (state) => state.user?.correo || 'Correo',
    getRole: (state) => state.user?.rol || 'Usuario', // Ejemplo para el rol
  },
});
