import { formatearPrecio } from "../../../common/utils/formato.js";

const etiquetasMetodo = {
    efectivo: "Efectivo",
    debito: "Débito",
    credito: "Crédito",
    transferencia: "Transferencia",
};

const formatearHora = (fecha) => {
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return "--:--";
    return valor.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

export function crearTablaVentas({ tbody }) {
    return {
        render(ventas) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (ventas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4">No hay comprobantes para este método.</td></tr>`;
                return;
            }

            ventas.forEach((venta) => {
                tbody.insertAdjacentHTML(
                    "beforeend",
                    `
                        <tr>
                        <td>${formatearHora(venta.fecha)}</td>
                        <td><strong>#${String(venta.id).padStart(4, "0")}</strong></td>
                        <td>${etiquetasMetodo[venta.metodoDePago] ?? venta.metodoDePago}</td>
                        <td><strong>${formatearPrecio(venta.monto)}</strong></td>
                        </tr>
                    `,
                );
            });
        },
    };
}
