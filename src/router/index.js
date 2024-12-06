import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import SignUpView from '../views/SignUpView.vue';
import CatalogoView from '../views/CatalogoView.vue';
import ABMUsuariosView from '../views/ABMUsuariosView.vue';
import ABMInventarioView from '../views/ABMInventarioView.vue';
import LogsUsuarioView from '../views/LogsUsuarioView.vue';
import LogsAplicacionView from '../views/LogsAplicacionView.vue';
import DetalleProductoView from '../views/DetalleProductoView.vue';
import VentasView from '../views/VentasView.vue';
import ReportesView from '../views/ReportesView.vue';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Asegúrate de que importas correctamente tu configuración de Firebase

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // Página de inicio
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUpView
  },
  {
    path: '/catalogo',
    name: 'catalogo',
    component: CatalogoView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/abmusuarios',
    name: 'abmusuarios',
    component: ABMUsuariosView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/abminventario',
    name: 'abminventario',
    component: ABMInventarioView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/logsusuario',
    name: 'logsusuario',
    component: LogsUsuarioView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/logsaplicacion',
    name: 'logsaplicacion',
    component: LogsAplicacionView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: VentasView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: ReportesView,
    //meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/detalle_producto/:id',  // Parámetro de ID
    name: 'DetalleProducto',
    component: DetalleProductoView,
    props: true // Para pasar el id como propiedad al componente
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Este guard verifica si el usuario está autenticado antes de acceder a rutas protegidas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next('/login'); // Redirige a la página de login si no está autenticado
    } else {
      next(); // Permite el acceso
    }
  });
});

export default router;
