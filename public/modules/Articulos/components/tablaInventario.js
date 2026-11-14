import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearTablaInventario({ tbody, onActualizar }) {
    if (tbody) {
        tbody.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-id]");
            if (!button) return;
            onActualizar(button.getAttribute("data-id"));
        });
    }

    return {
        render(productos, umbralesStock) {
            if (!tbody) return;

            tbody.innerHTML = "";

            productos.forEach((producto) => {
                const fila = document.createElement("tr");
                let claseStock = "neutro";

                if (producto.stock <= umbralesStock.critico) {
                    claseStock = "rojo";
                } else if (producto.stock <= umbralesStock.medio) {
                    claseStock = "naranja";
                }

                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td><strong>${producto.nombre}</strong></td>
                    <td>${producto.categoria}</td>
                    <td class="truncar-texto">${producto.descripcion}</td>
                    <td>$${producto.precio}</td>
                    <td><span class="badge ${claseStock}">${producto.stock}</span></td>
                    <td>
                        <button class="btn-primario" data-id="${producto.id}" data-nombre="${producto.nombre}" data-descripcion="${producto.descripcion}" data-stock="${producto.stock}">
                        Actualizar
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });

            renderizarIconos();
        },
    };
}
