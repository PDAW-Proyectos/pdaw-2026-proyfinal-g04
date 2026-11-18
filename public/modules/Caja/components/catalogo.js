import { formatearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function renderizarGrillaPrincipal(articulos) {
    const contenedor = document.getElementById("catalogo-grilla-principal");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    articulos.forEach((prod) => {
        const sinExistencias = Number(prod.stock) <= 0;
        const html = `
            <article
                class="card-producto ${sinExistencias ? "card-sin-stock" : ""}"
                data-id="${prod.id}"
                data-nombre="${prod.nombre}"
                data-precio="${prod.precio}"
                data-stock="${prod.stock ?? ""}"
                data-peso="${Boolean(prod.peso)}"
                data-unidad="${prod.unidadMedida ?? "u"}"
                data-categoria="${prod.categoria ?? ""}"
                aria-disabled="${sinExistencias}"
            >
                
                <div class="card-detalles">
                <h3 class="producto-nombre">${prod.nombre}</h3>
                <span class="producto-categoria">${prod.categoria ?? ""}</span>
                <div class="producto-footer">
                    <strong class="producto-precio">${formatearPrecio(prod.precio)}</strong>
                    <button type="button" class="btn-cantidad-catalogo ${String(prod.categoria).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === "verduleria" ? "btn-balanza-catalogo" : ""}" data-accion="abrir-modal-cantidad" aria-label="Cambiar cantidad" ${sinExistencias ? "disabled" : ""}>
                    ${String(prod.categoria).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === "verduleria"
                        ? '<i data-lucide="scale" aria-hidden="true"></i>'
                        : ""}
                    <span class="cantidad-label">CANT</span>
                    <span class="badge-cant">1</span>
                    </button>
                </div>
                </div>
            </article>
        `;
        contenedor.insertAdjacentHTML("beforeend", html);
    });

    renderizarIconos(contenedor);
}
