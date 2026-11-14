export function crearTransaccionesStore({ ventas, historial }) {
    const convertirFechaVenta = (fecha) => {
        const [fechaTexto] = fecha.split(" ");
        const [dia, mes, anio] = fechaTexto.split("/").map(Number);
        return new Date(anio, mes - 1, dia);
    };

    const obtenerRangoRapido = (filtro) => {
        if (filtro === "todos") {
            return { desde: null, hasta: null };
        }

        const hoy = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        if (filtro === "ayer") {
            inicio.setDate(inicio.getDate() - 1);
            return { desde: inicio, hasta: new Date(inicio) };
        }

        if (filtro === "semana") {
            const diaSemana = inicio.getDay();
            const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
            inicio.setDate(inicio.getDate() - diasDesdeLunes);
            const hasta = new Date(inicio);
            hasta.setDate(hasta.getDate() + 6);
            return { desde: inicio, hasta };
        }

        return { desde: inicio, hasta: new Date(inicio) };
    };

    return {
        filtrarVentas(metodo = "Todos") {
            if (metodo === "Todos") return [...ventas];
            return ventas.filter((venta) => venta.metodo === metodo);
        },

        filtrarHistorial({ termino = "", desde = null, hasta = null } = {}) {
            const busqueda = termino.toLowerCase();

            return historial.filter((venta) => venta.ticket.toLowerCase().includes(busqueda) && (!desde || convertirFechaVenta(venta.fecha) >= desde) && (!hasta || convertirFechaVenta(venta.fecha) <= hasta));
        },

        obtenerRangoRapido,
        convertirFechaVenta,
    };
}
