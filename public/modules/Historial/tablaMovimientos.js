function formatearFecha(isoString) {
    const fecha = new Date(isoString);
    if (Number.isNaN(fecha.getTime())) return isoString;

    const dia = fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const hora = fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${dia} · ${hora}`;
}

function obtenerEtiquetaUnidad(unidadMedida) {
    return unidadMedida === "unidad" ? "u." : unidadMedida;
}

function obtenerBadgeTipo(tipo) {
    const etiquetas = {
        entrada: { texto: "Entrada", clase: "badge badge-verde" },
        salida: { texto: "Salida", clase: "badge rojo" },
        eliminacion: { texto: "Eliminación", clase: "badge naranja" },
    };
    const etiqueta = etiquetas[tipo];

    if (!etiqueta) {
        throw new Error(`Tipo de movimiento inválido: ${tipo}`);
    }

    return etiqueta;
}

export function crearTablaMovimientos({ tbody }) {
    return {
        render(movimientos = []) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (movimientos.length === 0) {
                const filaVacia = document.createElement("tr");
                filaVacia.innerHTML = `
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #777b70;">
                        Todavía no hay movimientos de stock registrados.
                    </td>
                `;
                tbody.appendChild(filaVacia);
                return;
            }

            const movimientosOrdenados = [...movimientos].sort((a, b) => {
                const diferenciaFecha = Date.parse(b.fecha) - Date.parse(a.fecha);
                return diferenciaFecha || Number(b.id) - Number(a.id);
            });

            movimientosOrdenados.forEach((mov) => {
                const fila = document.createElement("tr");
                const unidad = obtenerEtiquetaUnidad(mov.unidadMedida);
                const badge = obtenerBadgeTipo(mov.tipo);
                const signo = mov.cantidad > 0 ? "+" : "";

                fila.innerHTML = `
                    <td class="td-codigo">${mov.id}</td>
                    <td>${formatearFecha(mov.fecha)}</td>
                    <td class="td-nombre">
                        <div>${mov.nombreProducto}</div>
                        <small style="color: #777b70; font-weight: 400;">${mov.nombreCategoria || ""}</small>
                    </td>
                    <td><span class="${badge.clase}">${badge.texto}</span></td>
                    <td style="font-weight: 600;">${signo}${mov.cantidad} ${unidad}</td>
                    <td>${mov.stockAnterior} → <strong>${mov.stockNuevo} ${unidad}</strong></td>
                    <td>${mov.nombreUsuario}</td>
                `;

                tbody.appendChild(fila);
            });
        },
    };
}