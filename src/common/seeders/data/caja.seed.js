
export const cajasSeed = [
    {
        id: 1,
        usuarioAbre: 1,
        usuarioCierra: 1,
        totalEsperado: 156200,
        totalContado: 156000,
        diferencia: -200,
        fechaApertura: "2026-11-02T09:00:00.000Z",
        fechaCierre: "2026-11-02T19:00:00.000Z",
        estado: "cerrada",
        montoInicial: 70000,
        observaciones: [
            "Apertura de caja inicial",
            "Se verificó el efectivo disponible",
            "Se registraron ventas y movimientos durante el turno",
            "Se detectó un faltante de $200 al realizar el arqueo"
        ],
        historialDeTransacciones: [6, 7, 11, 12, 16, 17],
        nroCaja: 1
    },
    {
        id: 2,
        usuarioAbre: 1,
        usuarioCierra: 1,
        totalEsperado: 141800,
        totalContado: 142300,
        diferencia: 500,
        fechaApertura: "2026-11-06T09:00:00.000Z",
        fechaCierre: "2026-11-08T20:00:00.000Z",
        estado: "cerrada",
        montoInicial: 70000,
        observaciones: [
            "Apertura de caja inicial",
            "Se verificó el efectivo disponible",
            "Se realizaron ventas y retiros de efectivo",
            "Se detectó un sobrante de $500 al realizar el arqueo"
        ],
        historialDeTransacciones: [8, 9, 13, 14, 18, 19],
        nroCaja: 2
    },
    {
        id: 3,
        usuarioAbre: 1,
        usuarioCierra: 1,
        totalEsperado: 127600,
        totalContado: 127600,
        diferencia: 0,
        fechaApertura: "2026-11-11T09:00:00.000Z",
        fechaCierre: "2026-11-11T19:00:00.000Z",
        estado: "cerrada",
        montoInicial: 70000,
        observaciones: [
            "Apertura de caja inicial",
            "Se verificó el efectivo disponible",
            "Se registraron ventas y movimientos durante el turno",
            "El arqueo de caja coincidió con el total esperado"
        ],
        historialDeTransacciones: [10, 15, 20],
        nroCaja: 3
    }
];
