import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearTablaProveedores({ tbody }) {
    return {
        render(proveedores) {
            if (!tbody) return;

            tbody.innerHTML = "";

            if (proveedores.length === 0) {
                const fila = document.createElement("tr");
                fila.innerHTML = '<td colspan="6">No hay proveedores registrados.</td>';
                tbody.appendChild(fila);
                return;
            }

            proveedores.forEach((prov) => {
                const fila = document.createElement("tr");
                const claseEstado = prov.estado === "Activo" ? "stock-normal" : "stock-critico";

                fila.innerHTML = `
					<td>${prov.id}</td>
					<td><strong>${prov.empresa}</strong></td>
					<td>${prov.rubro}</td>
					<td>${prov.contacto}</td>
					<td>${prov.telefono}</td>
					<td><span class="badge-stock ${claseEstado}">${prov.estado}</span></td>
				`;
                tbody.appendChild(fila);
            });

            renderizarIconos();
        },
    };
}
