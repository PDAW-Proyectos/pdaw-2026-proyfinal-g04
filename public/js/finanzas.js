document.addEventListener("DOMContentLoaded", () => {
  
  // Mocks
  const datosMockCards = {
    ventas: {
      dia: { valor: "$ 48.340", tendencia: "↑ +2% vs ayer", claseTendencia: "positivo" },
      mes: { valor: "$ 1.450.300", tendencia: "↑ +12% vs mes ant.", claseTendencia: "positivo" },
      anio: { valor: "$ 15.200.000", tendencia: "↑ +8% vs año ant.", claseTendencia: "positivo" }
    },
    tickets: {
      dia: { valor: "15", tendencia: "Operaciones registradas", claseTendencia: "neutro" },
      mes: { valor: "412", tendencia: "Operaciones registradas", claseTendencia: "neutro" },
      anio: { valor: "4.850", tendencia: "Operaciones registradas", claseTendencia: "neutro" }
    },
    promedio: {
      dia: { valor: "$ 3.222", tendencia: "↓ -1% vs ayer", claseTendencia: "neutro" },
      mes: { valor: "$ 3.520", tendencia: "↑ +5% vs mes ant.", claseTendencia: "positivo" },
      anio: { valor: "$ 3.134", tendencia: "↑ +2% vs año ant.", claseTendencia: "positivo" }
    }
  };

  const mockGraficos = {
    ventas: {
      mes: {
        labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        data: [250000, 380000, 410000, 410300]
      },
      anio: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        data: [900000, 1100000, 1050000, 1200000, 1350000, 1150000, 1400000, 1450000, 1300000, 1500000, 1450300, 0]
      }
    },
    precios: {
      anio: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        data: [10, 15, 22, 28, 35, 42, 50, 58, 65, 75, 82, 0] 
      },
      historico: {
        labels: ["2023", "2024", "2025", "2026"],
        data: [0, 120, 280, 410] 
      }
    },
    pagos: {
      mes: {
        labels: ["Efectivo", "Tarjetas / Transferencia"],
        data: [45, 55] // Porcentajes
      },
      anio: {
        labels: ["Efectivo", "Tarjetas / Transferencia"],
        data: [35, 65] 
      }
    }
  };


  // Tarjetas
  async function actualizarCard(cardId, periodo, cardElement) {
    const data = datosMockCards[cardId]?.[periodo];

    if (data && cardElement) {
      const valorElement = cardElement.querySelector(".card-valor");
      const tendenciaElement = cardElement.querySelector(".card-tendencia");

      if (valorElement) valorElement.style.opacity = 0;
      if (tendenciaElement) tendenciaElement.style.opacity = 0;

      setTimeout(() => {
        if (valorElement) {
          valorElement.textContent = data.valor;
          valorElement.style.opacity = 1;
        }
        if (tendenciaElement) {
          tendenciaElement.textContent = data.tendencia;
          tendenciaElement.className = `card-tendencia ${data.claseTendencia}`;
          tendenciaElement.style.opacity = 1;
        }
      }, 150);
    }
  }


  // Gráficos (chart.js)
  let chartVentas = null;
  let chartPrecios = null;
  let chartPagos = null;

  function renderizarGrafico(idCanvas, tipo, datos, colorPrincipal) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: tipo,
      data: {
        labels: datos.labels,
        datasets: [{
          label: '',
          data: datos.data,
          borderColor: colorPrincipal,
          backgroundColor: `${colorPrincipal}33`, 
          borderWidth: 2,
          tension: 0.3, 
          fill: tipo === 'line' 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, 
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.parsed.y || '';
                return idCanvas === 'grafico-ventas' ? `$ ${label.toLocaleString()}` : `${label}%`;
              }
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { color: '#e2e4dc', borderDash: [5, 5] },
            border: { display: false }
          },
          x: { 
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  function renderizarDona(idCanvas, datos) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: datos.labels,
        datasets: [{
          data: datos.data,
          backgroundColor: ['#a4d92b', '#171914'], 
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', 
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { color: '#777b70', usePointStyle: true, padding: 20 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });
  }

  function iniciarGraficos() {
    chartVentas = renderizarGrafico('grafico-ventas', 'bar', mockGraficos.ventas.mes, '#a4d92b'); 
    chartPrecios = renderizarGrafico('grafico-precios', 'line', mockGraficos.precios.anio, '#ef4444'); 
    chartPagos = renderizarDona('grafico-pagos', mockGraficos.pagos.mes);
  }

  iniciarGraficos();


  // Filtros de las cards y graficos
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("filtro-card")) {
      const select = e.target;
      const periodo = select.value; 
      
      const cardId = select.getAttribute("data-card");
      const graficoId = select.getAttribute("data-grafico");

      // Si el select pertenece a una Tarjeta
      if (cardId) {
        const cardElement = select.closest(".card");
        actualizarCard(cardId, periodo, cardElement);
      } 
      // Si el select pertenece a un Gráfico
      else if (graficoId) {
        if (graficoId === "ventas" && chartVentas) {
          chartVentas.destroy(); 
          chartVentas = renderizarGrafico('grafico-ventas', 'bar', mockGraficos.ventas[periodo], '#a4d92b');
        } else if (graficoId === "precios" && chartPrecios) {
          chartPrecios.destroy();
          chartPrecios = renderizarGrafico('grafico-precios', 'line', mockGraficos.precios[periodo], '#ef4444');
        } else if (graficoId === "pagos" && chartPagos) {
          chartPagos.destroy();
          chartPagos = renderizarDona('grafico-pagos', mockGraficos.pagos[periodo]);
        }
      }
    }
  });

});