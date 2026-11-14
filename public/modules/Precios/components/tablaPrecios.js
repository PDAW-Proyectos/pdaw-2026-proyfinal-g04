import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearTablaPrecios({ tbody, onEditar }) {
    if (tbody) {
        tbody.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-id]");
            if (!button) return;
            onEditar(button.getAttribute("data-id"));
        });
    }

    return {
        render(catalogo, hayCambiosSinGuardar) {
            if (!tbody) return;

            tbody.innerHTML = "";

            catalogo.forEach((prod) => {
                const fila = document.createElement("tr");
                const clasePrecio = hayCambiosSinGuardar ? "td-ars precio-borrador" : "td-ars";

                fila.innerHTML = `
                    <td class="td-codigo">${prod.id}</td>
                    <td class="td-nombre">${prod.nombre}</td>
                    <td class="td-usd">U$D ${prod.precioUsd.toFixed(2)}</td>
                    <td class="${clasePrecio}">$ ${(prod.precioArs ?? 0).toLocaleString("es-AR")}</td>
                    <td>
                        <button type="button" class="btn-primario btn-chico" data-id="${prod.id}">
                        <i data-lucide="square-pen" class="icono-chico"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });

            renderizarIconos();
        },
    };
}
