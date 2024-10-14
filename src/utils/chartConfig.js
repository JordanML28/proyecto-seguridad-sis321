export const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Productos'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Gráfico de Barras'
      }
    }
  };
  
  export const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Gráfico de Torta'
      }
    }
  };
  
  export const generateBarChartData = (labels, data, label) => {
    return {
      labels: labels,
      datasets: [{
        label: label,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        data: data
      }]
    };
  };
  
  export const generatePieChartData = (labels, data) => {
    return {
      labels: labels,
      datasets: [{
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        data: data
      }]
    };
  };
  