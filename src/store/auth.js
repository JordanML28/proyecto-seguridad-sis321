// store/auth.js
const state = {
    user: null,
    // otros estados
  };
  
  const mutations = {
    SET_USER(state, user) {
      state.user = user;
    },
    CLEAR_USER(state) {
      state.user = null; // Limpia el usuario
      // Limpia otros datos según sea necesario
    },
  };
  
  const actions = {
    signIn({ commit }, user) {
      commit('SET_USER', user);
    },
    signOut({ commit }) {
      commit('CLEAR_USER'); // Llama a la mutación para limpiar el usuario
    },
    // Otras acciones...
  };
  
  export default {
    state,
    mutations,
    actions,
  };
  