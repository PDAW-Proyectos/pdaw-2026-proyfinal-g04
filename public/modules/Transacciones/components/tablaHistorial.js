import { formatearPrecio } from "../../../common/utils/formato.js";

const etiquetasMetodo = {
    efectivo: "Efectivo",
    debito: "Débito",
    credito: "Crédito",
    transferencia: "Transferencia",
};

const formatearFecha = (fecha) => {
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return "--";
    return valor.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

export function crearTablaHistorial({ tbody }) {
    return {
        render(transacciones) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (transacciones.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5">No se encontraron tickets.</td></tr>`;
                return;
            }

            transacciones.forEach((transaccion) => {
                const esIngreso = Number(transaccion.monto) > 0;
                const estado = esIngreso ? "Cobrado" : "Egreso";
                const claseEstado = esIngreso ? "badge-ingreso" : "badge-retiro";

                tbody.insertAdjacentHTML(
                    "beforeend",
                    `
                        <tr>
                        <td>${formatearFecha(transaccion.fecha)}</td>
                        <td><strong>#${String(transaccion.id).padStart(4, "0")}</strong></td>
                        <td><strong>${formatearPrecio(transaccion.monto)}</strong></td>
                        <td>${etiquetasMetodo[transaccion.metodoDePago] ?? transaccion.metodoDePago}</td>
                        <td><span class="badge-movimiento ${claseEstado}">${estado}</span></td>
                        </tr>
                    `,
                );
            });
        },
    };
}
