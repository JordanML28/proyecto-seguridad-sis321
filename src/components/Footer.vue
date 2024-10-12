<template>
  <div class="footer">
        <div class="column">
            <h2>Contactos</h2>
            <p><i class="fab fa-whatsapp icon" id="whatsapp"></i> Whatsapp</p>
            <p><i class="far fa-envelope icon" id="gmail"></i> Gmail</p>
            <p><i class="fas fa-copyright icon"  id="copyright"></i> Drawish.2023</p>
        </div>

        <div class="column">
            <h2>Visita la Tienda</h2>
            <p>Ver mapa</p>
            <p>Horario de atención en tienda:</p>
            <p>Lunes a viernes y domingo:</p>
            <p>10:00 AM - 07:00 PM</p>
        </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
}
</script>

<style scoped>
.footer {
    font-family: Arial, sans-serif;
    background-color: #333;
    color: white;
    padding: 20px 0;
    width: 100%;
    margin-top: 30px;
    text-align: center;
    display: flex;
    justify-content: space-between;
}

.column {
    width: 45%;
}

.column p {
    margin: 5px 0;
}

.icon {
    color: white;
    margin-right: 5px;
}

#whatsapp{
    color: #25d366;
}

#gmail {
    color: #ea4335;
}
#copyright {
    color: #ffdc5f;
}
</style>
