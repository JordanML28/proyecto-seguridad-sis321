// src/store/store.js
import { createStore } from 'vuex';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase

export default createStore({
  state: {
    isAuthenticated: false,
    username: '',
  },
  mutations: {
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
    },
    setUsername(state, username) {
      state.username = username;
    }
  },
  actions: {
    login({ commit }, user) {
      commit('SET_USER', user); // Guarda todos los datos del usuario en Vuex
    },
    logout({ commit }) {
      commit('CLEAR_USER');
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user; // Guarda el objeto completo del usuario
      state.isAuthenticated = true;
    },
    CLEAR_USER(state) {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  state: {
    user: null, // Aquí se almacenará toda la información del usuario
    isAuthenticated: false
  },
  getters: {
    // Puedes agregar getters para acceder a campos específicos
    getUser: state => state.user,
    getRole: state => state.user?.rol || 'usuario', // Ejemplo para el rol
  }
  
});
