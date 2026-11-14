import { formatearPrecio } from "../../../common/utils/formato.js";

export function crearTablaVentas({ tbody }) {
    return {
        render(ventas) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (ventas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5">No hay comprobantes para este método.</td></tr>`;
                return;
            }

            ventas.forEach((venta) => {
                tbody.insertAdjacentHTML(
                    "beforeend",
                    `
                        <tr>
                        <td>${venta.hora}</td>
                        <td><strong>${venta.ticket}</strong></td>
                        <td>${venta.metodo}</td>
                        <td><strong>${formatearPrecio(venta.total)}</strong></td>
                        <td class="acciones-comprobante">
                            <button type="button" class="btn-tabla-accion" data-accion="ver-detalle">Ver Detalle</button>
                            <button type="button" class="btn-tabla-accion" data-accion="reimprimir">Reimprimir</button>
                        </td>
                        </tr>
                    `,
                );
            });
        },
    };
}
