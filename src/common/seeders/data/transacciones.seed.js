
export const transaccionesSeed = [
    // egresos compras
    {
        id: 1,
        monto: -85000,
        idUsuario: 2,
        fecha: "2026-11-02T10:30:00.000Z",
        metodoDePago: "efectivo",
        articulos: [
            { id: 1, tipo: "producto", cantidad: 20 },
            { id: 3, tipo: "producto", cantidad: 15 },
            { id: 5, tipo: "producto", cantidad: 10 }
        ]
    },
    {
        id: 2,
        monto: -42000,
        idUsuario: 2,
        fecha: "2026-11-03T14:15:00.000Z",
        metodoDePago: "transferencia",
        articulos: [
            { id: 6, tipo: "producto", cantidad: 8 },
            { id: 7, tipo: "producto", cantidad: 12 },
            { id: 8, tipo: "producto", cantidad: 5 }
        ]
    },
    {
        id: 3,
        monto: -65000,
        idUsuario: 2,
        fecha: "2026-11-05T11:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: [
            { id: 1, tipo: "insumo", cantidad: 25 },
            { id: 2, tipo: "insumo", cantidad: 15 },
            { id: 5, tipo: "insumo", cantidad: 20 }
        ]
    },
    {
        id: 4,
        monto: -38000,
        idUsuario: 2,
        fecha: "2026-11-07T09:45:00.000Z",
        metodoDePago: "transferencia",
        articulos: [
            { id: 6, tipo: "insumo", cantidad: 100 },
            { id: 7, tipo: "insumo", cantidad: 150 },
            { id: 10, tipo: "insumo", cantidad: 200 }
        ]
    },
    {
        id: 5,
        monto: -92000,
        idUsuario: 2,
        fecha: "2026-11-10T13:20:00.000Z",
        metodoDePago: "efectivo",
        articulos: [
            { id: 9, tipo: "insumo", cantidad: 12 },
            { id: 4, tipo: "insumo", cantidad: 8 },
            { id: 2, tipo: "producto", cantidad: 30 }
        ]
    },

    // egresos retiros
    {
        id: 6,
        idCaja: 1,
        monto: -15000,
        idUsuario: 1,
        fecha: "2026-11-02T16:30:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 7,
        idCaja: 1,
        monto: -10000,
        idUsuario: 1,
        fecha: "2026-11-03T18:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 8,
        idCaja: 2,
        monto: -20000,
        idUsuario: 1,
        fecha: "2026-11-06T15:45:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 9,
        idCaja: 2,
        monto: -12000,
        idUsuario: 1,
        fecha: "2026-11-08T17:15:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 10,
        idCaja: 3,
        monto: -18000,
        idUsuario: 1,
        fecha: "2026-11-11T16:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },

    // ingresos ventas
    {
        id: 11,
        idCaja: 1,
        monto: 12500,
        idUsuario: 3,
        fecha: "2026-11-02T11:30:00.000Z",
        metodoDePago: "efectivo",
        articulos: [
            { id: 1, cantidad: 2 },
            { id: 3, cantidad: 1 },
            { id: 5, cantidad: 2 }
        ]
    },
    {
        id: 12,
        idCaja: 1,
        monto: 18700,
        idUsuario: 3,
        fecha: "2026-11-03T12:45:00.000Z",
        metodoDePago: "debito",
        articulos: [
            { id: 2, cantidad: 3 },
            { id: 4, cantidad: 2 },
            { id: 6, cantidad: 1 }
        ]
    },
    {
        id: 13,
        idCaja: 2,
        monto: 9500,
        idUsuario: 3,
        fecha: "2026-11-06T13:20:00.000Z",
        metodoDePago: "efectivo",
        articulos: [
            { id: 7, cantidad: 1 },
            { id: 8, cantidad: 1 }
        ]
    },
    {
        id: 14,
        idCaja: 2,
        monto: 24300,
        idUsuario: 3,
        fecha: "2026-11-08T12:10:00.000Z",
        metodoDePago: "credito",
        articulos: [
            { id: 1, cantidad: 3 },
            { id: 5, cantidad: 4 },
            { id: 9, cantidad: 2 }
        ]
    },
    {
        id: 15,
        idCaja: 3,
        monto: 15600,
        idUsuario: 3,
        fecha: "2026-11-11T14:30:00.000Z",
        metodoDePago: "transferencia",
        articulos: [
            { id: 3, cantidad: 2 },
            { id: 10, cantidad: 3 }
        ]
    },

    // ingresos inyeccion
    {
        id: 16,
        idCaja: 1,
        monto: 50000,
        idUsuario: 1,
        fecha: "2026-11-02T09:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 17,
        idCaja: 1,
        monto: 30000,
        idUsuario: 1,
        fecha: "2026-11-04T09:15:00.000Z",
        metodoDePago: "transferencia",
        articulos: []
    },
    {
        id: 18,
        idCaja: 2,
        monto: 45000,
        idUsuario: 1,
        fecha: "2026-11-06T09:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    },
    {
        id: 19,
        idCaja: 2,
        monto: 25000,
        idUsuario: 1,
        fecha: "2026-11-08T09:30:00.000Z",
        metodoDePago: "transferencia",
        articulos: []
    },
    {
        id: 20,
        idCaja: 3,
        monto: 60000,
        idUsuario: 1,
        fecha: "2026-11-11T09:00:00.000Z",
        metodoDePago: "efectivo",
        articulos: []
    }
];
