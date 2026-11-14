export function crearTablaHistorial({ tbody }) {
    return {
        render(ventas) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (ventas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6">No se encontraron tickets.</td></tr>`;
                return;
            }

            ventas.forEach((venta) => {
                const estaDevuelto = venta.estado === "Devuelto";
                const badgeEstado = estaDevuelto ? `<span class="badge-movimiento badge-retiro">Devuelto</span>` : `<span class="badge-movimiento badge-ingreso">Cobrado</span>`;

                tbody.insertAdjacentHTML(
                    "beforeend",
                    `
                        <tr>
                        <td>${venta.fecha}</td>
                        <td><strong>${venta.ticket}</strong></td>
                        <td><strong>$ ${venta.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></td>
                        <td>${venta.metodo}</td>
                        <td>${badgeEstado}</td>
                        <td class="acciones-comprobante">
                            <button type="button" class="btn-tabla-accion btn-accion-reimprimir" data-accion="reimprimir-ticket">
                            Reimprimir
                            </button>
                            <button type="button" class="btn-tabla-accion btn-accion-cambio" data-accion="abrir-modal-historial" ${estaDevuelto ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ""}>
                            Acciones
                            </button>
                        </td>
                        </tr>
                    `,
                );
            });
        },
    };
}
