export const datosMockCards = {
    ventas: {
        dia: {
            valor: "$ 48.340",
            tendencia: "↑ +2% vs ayer",
            claseTendencia: "positivo",
        },
        mes: {
            valor: "$ 1.450.300",
            tendencia: "↑ +12% vs mes ant.",
            claseTendencia: "positivo",
        },
        anio: {
            valor: "$ 15.200.000",
            tendencia: "↑ +8% vs año ant.",
            claseTendencia: "positivo",
        },
    },
    tickets: {
        dia: {
            valor: "15",
            tendencia: "Operaciones registradas",
            claseTendencia: "neutro",
        },
        mes: {
            valor: "412",
            tendencia: "Operaciones registradas",
            claseTendencia: "neutro",
        },
        anio: {
            valor: "4.850",
            tendencia: "Operaciones registradas",
            claseTendencia: "neutro",
        },
    },
    promedio: {
        dia: {
            valor: "$ 3.222",
            tendencia: "↓ -1% vs ayer",
            claseTendencia: "neutro",
        },
        mes: {
            valor: "$ 3.520",
            tendencia: "↑ +5% vs mes ant.",
            claseTendencia: "positivo",
        },
        anio: {
            valor: "$ 3.134",
            tendencia: "↑ +2% vs año ant.",
            claseTendencia: "positivo",
        },
    },
};

export const mockGraficos = {
    ventas: {
        mes: {
            labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
            data: [250000, 380000, 410000, 410300],
        },
        anio: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            data: [900000, 1100000, 1050000, 1200000, 1350000, 1150000, 1400000, 1450000, 1300000, 1500000, 1450300, 0],
        },
    },
    precios: {
        anio: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            data: [10, 15, 22, 28, 35, 42, 50, 58, 65, 75, 82, 0],
        },
        historico: {
            labels: ["2023", "2024", "2025", "2026"],
            data: [0, 120, 280, 410],
        },
    },
    pagos: {
        mes: {
            labels: ["Efectivo", "Tarjetas / Transferencia"],
            data: [45, 55],
        },
        anio: {
            labels: ["Efectivo", "Tarjetas / Transferencia"],
            data: [35, 65],
        },
    },
};
