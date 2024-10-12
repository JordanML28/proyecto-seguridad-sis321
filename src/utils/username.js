// utils/username.js
export function generateUsername(nombre, apellido1, apellido2, telefono) {
    const iniciales = `${nombre.charAt(0)}${apellido1.charAt(0)}${apellido2.charAt(0)}`;
    const telefonoPart = telefono.slice(0, 4); // Primeros 4 dígitos del teléfono
    return `${iniciales}${telefonoPart}${"UCB"}`.toUpperCase(); // Nombre de usuario generado
  }
  
