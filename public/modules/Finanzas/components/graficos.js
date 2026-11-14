export function crearGraficos(mockGraficos) {
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
                datasets: [
                    {
                        label: "",
                        data: datos.data,
                        borderColor: colorPrincipal,
                        backgroundColor: `${colorPrincipal}33`,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: tipo === "line",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const label = context.parsed.y || "";
                                return idCanvas === "grafico-ventas" ? `$ ${label.toLocaleString()}` : `${label}%`;
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "#e2e4dc", borderDash: [5, 5] },
                        border: { display: false },
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                    },
                },
            },
        });
    }

    function renderizarDona(idCanvas, datos) {
        const ctx = document.getElementById(idCanvas);
        if (!ctx) return null;

        return new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: datos.labels,
                datasets: [
                    {
                        data: datos.data,
                        backgroundColor: ["#a4d92b", "#171914"],
                        borderWidth: 0,
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#777b70",
                            usePointStyle: true,
                            padding: 20,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return ` ${context.label}: ${context.parsed}%`;
                            },
                        },
                    },
                },
            },
        });
    }

    return {
        iniciar() {
            chartVentas = renderizarGrafico("grafico-ventas", "bar", mockGraficos.ventas.mes, "#a4d92b");
            chartPrecios = renderizarGrafico("grafico-precios", "line", mockGraficos.precios.anio, "#ef4444");
            chartPagos = renderizarDona("grafico-pagos", mockGraficos.pagos.mes);
        },

        actualizar(graficoId, periodo) {
            if (graficoId === "ventas" && chartVentas) {
                chartVentas.destroy();
                chartVentas = renderizarGrafico("grafico-ventas", "bar", mockGraficos.ventas[periodo], "#a4d92b");
            } else if (graficoId === "precios" && chartPrecios) {
                chartPrecios.destroy();
                chartPrecios = renderizarGrafico("grafico-precios", "line", mockGraficos.precios[periodo], "#ef4444");
            } else if (graficoId === "pagos" && chartPagos) {
                chartPagos.destroy();
                chartPagos = renderizarDona("grafico-pagos", mockGraficos.pagos[periodo]);
            }
        },
    };
}
