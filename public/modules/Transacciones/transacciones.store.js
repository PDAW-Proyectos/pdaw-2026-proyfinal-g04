const inicioDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
const finDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);

export function crearTransaccionesStore() {
    const obtenerRangoRapido = (filtro) => {
        const hoy = new Date();
        const inicio = inicioDelDia(hoy);

        if (filtro === "todos") {
            return { desde: null, hasta: null };
        }

        if (filtro === "ayer") {
            inicio.setDate(inicio.getDate() - 1);
            return { desde: inicio, hasta: finDelDia(inicio) };
        }

        if (filtro === "semana") {
            const diaSemana = inicio.getDay();
            const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
            inicio.setDate(inicio.getDate() - diasDesdeLunes);
            return { desde: inicio, hasta: finDelDia(hoy) };
        }

        return { desde: inicio, hasta: finDelDia(hoy) };
    };

    return {
        filtrarVentas(ventas, metodo = "Todos") {
            if (metodo === "Todos") return [...ventas];
            return ventas.filter((venta) => venta.metodoDePago === metodo);
        },

        filtrarHistorial(historial, { desde = null, hasta = null } = {}) {
            return historial.filter((transaccion) => {
                const fecha = new Date(transaccion.fecha);
                if (Number.isNaN(fecha.getTime())) return false;
                if (desde && fecha < inicioDelDia(desde)) return false;
                if (hasta && fecha > finDelDia(hasta)) return false;
                return true;
            });
        },

        obtenerRangoRapido,
    };
}
