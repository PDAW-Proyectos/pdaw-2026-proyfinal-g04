import { formatearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function renderizarGrillaPrincipal(articulos) {
    const contenedor = document.getElementById("catalogo-grilla-principal");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    articulos.forEach((prod) => {
        const html = `
            <article class="card-producto" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
                <div class="card-img">
                <i data-lucide="package" aria-hidden="true"></i>
                </div>
                <div class="card-detalles">
                <h3 class="producto-nombre">${prod.nombre}</h3>
                <div class="producto-footer">
                    <strong class="producto-precio">${formatearPrecio(prod.precio)}</strong>
                    <button type="button" class="btn-cantidad-catalogo" data-accion="abrir-modal-cantidad" aria-label="Cambiar cantidad">
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
