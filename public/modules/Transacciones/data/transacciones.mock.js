export const ventasTurnoMock = [
    { hora: "19:15", ticket: "#0032", metodo: "Efectivo", total: 1200.0 },
    { hora: "19:02", ticket: "#0031", metodo: "Tarjeta", total: 3450.0 },
    { hora: "18:45", ticket: "#0030", metodo: "Efectivo", total: 850.0 },
    { hora: "18:22", ticket: "#0029", metodo: "Billeteras / QR", total: 2100.0 },
];

export const historialBaseMock = [
    {
        fecha: "10/11/2026 19:15",
        ticket: "#0032",
        total: 1200.0,
        metodo: "Efectivo",
        estado: "Cobrado",
    },
    {
        fecha: "09/11/2026 14:20",
        ticket: "#0031",
        total: 3450.0,
        metodo: "Tarjeta",
        estado: "Cobrado",
    },
    {
        fecha: "05/11/2026 10:10",
        ticket: "#0030",
        total: 850.0,
        metodo: "Efectivo",
        estado: "Devuelto",
    },
    {
        fecha: "02/11/2026 18:22",
        ticket: "#0029",
        total: 2100.0,
        metodo: "Billeteras / QR",
        estado: "Cobrado",
    },
];

export const opcionesCambioReintegro = `
    <option value="" disabled selected>Seleccioná un motivo</option>
    <option value="cambio_talle">Cambio de talle</option>
    <option value="cambio_modelo">Cambio de modelo / color</option>
    <option value="otro">Otro</option>
`;

export const opcionesDevolucion = `
    <option value="" disabled selected>Seleccioná un motivo</option>
    <option value="falla">Falla de fábrica</option>
    <option value="cambio_opinion">Cambio de opinión</option>
    <option value="otro">Otro</option>
`;
