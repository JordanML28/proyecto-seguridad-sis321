<template>
  <div>
    <h1>Reportes de Inventario</h1>

    <!-- Sección de Gráficos de Barras en una fila -->
    <div class="bar-charts-container">
      <!-- Gráfico de Barras: Stock por Producto -->
      <div class="bar-chart">
        <h2>Stock por Producto</h2>
        <div class="chart-margin">
          <div id="bar-chart-stock" style="width: 100%; height: 400px;"></div>
        </div>
      </div>

      <!-- Gráfico de Barras: Precio por Producto -->
      <div class="bar-chart">
        <h2>Precio por Producto</h2>
        <div class="chart-margin">
          <div id="bar-chart-price" style="width: 100%; height: 400px;"></div>
        </div>
      </div>
    </div>

    <!-- Gráfico de Torta: Distribución de Stock -->
    <h2>Distribución de Stock</h2>
    <div id="pie-chart-stock" style="width: 100%; height: 500px;"></div>

    <!-- Gráfico de Torta: Distribución de Precio -->
    <h2>Distribución de Precio</h2>
    <div id="pie-chart-price" style="width: 100%; height: 500px;"></div>
  </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default {
  setup() {
    const productos = ref([]); // Aquí almacenaremos los productos de Firestore

    const loadGoogleCharts = () => {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.onload = () => {
        google.charts.load('current', { packages: ['corechart', 'bar'] });
      };
      document.head.appendChild(script);
    };

    const getProductosData = async () => {
      const db = getFirestore(); // Obtener la instancia de Firestore
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      productosSnapshot.forEach((doc) => {
        productos.value.push(doc.data());
      });
      drawCharts();
    };

    const drawCharts = () => {
      google.charts.setOnLoadCallback(() => {
        drawBarChartStock();
        drawBarChartPrice();
        drawPieChartStock();
        drawPieChartPrice();
      });
    };

    const drawBarChartStock = () => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Producto');
      data.addColumn('number', 'Stock');

      productos.value.forEach((producto) => {
        data.addRow([producto.producto, producto.stock]);
      });

      const options = {
        title: 'Stock por Producto',
        chartArea: { width: '50%' },
        hAxis: { title: 'Stock', minValue: 0 },
        vAxis: { title: 'Producto' },
        colors: ['rgb(13, 172, 16)'] // Colores personalizados para las barras
        };

      const chart = new google.visualization.BarChart(document.getElementById('bar-chart-stock'));
      chart.draw(data, options);
    };

    const drawBarChartPrice = () => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Producto');
      data.addColumn('number', 'Precio');

      productos.value.forEach((producto) => {
        data.addRow([producto.producto, producto.precio]);
      });

      const options = {
        title: 'Precio por Producto',
        chartArea: { width: '50%' },
        hAxis: { title: 'Precio', minValue: 0 },
        vAxis: { title: 'Producto' }
      };

      const chart = new google.visualization.BarChart(document.getElementById('bar-chart-price'));
      chart.draw(data, options);
    };

    const drawPieChartStock = () => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Producto');
      data.addColumn('number', 'Stock');

      productos.value.forEach((producto) => {
        data.addRow([producto.producto, producto.stock]);
      });

      const options = {
        title: 'Distribución de Stock por Producto'
      };

      const chart = new google.visualization.PieChart(document.getElementById('pie-chart-stock'));
      chart.draw(data, options);
    };

    const drawPieChartPrice = () => {
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Producto');
      data.addColumn('number', 'Precio');

      productos.value.forEach((producto) => {
        data.addRow([producto.producto, producto.precio]);
      });

      const options = {
        title: 'Distribución de Precio por Producto'
      };

      const chart = new google.visualization.PieChart(document.getElementById('pie-chart-price'));
      chart.draw(data, options);
    };

    onMounted(() => {
      loadGoogleCharts();
      getProductosData();
    });

    return {
      productos
    };
  }
};
</script>

<style scoped>
h1, h2 {
  text-align: center;
  margin-bottom: 20px;
}
.bar-charts-container {
  display: flex;
  flex-direction: column; /* Mantiene los gráficos en una sola columna */
  align-content: center;
  margin-bottom: 20px; /* Espacio entre la fila de gráficos y los gráficos de torta */
}
.bar-chart {
  width: 80%; /* Ajusta el ancho de cada gráfico para que quepan en la fila */
  margin: 10px auto; /* Añade margen automático para centrar los gráficos */
}

.chart-margin {
  padding: 2px; /* Espacio interno para el margen */
  background-color: #d7d6d6; /* Color de fondo del margen */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Sombra para efecto de profundidad */
}
</style>
