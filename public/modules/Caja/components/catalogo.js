import { formatearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function renderizarGrillaPrincipal(articulos) {
    const contenedor = document.getElementById("catalogo-grilla-principal");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    articulos.forEach((prod) => {
        const sinExistencias = Number(prod.stock) <= 0;
        const sinPrecio = prod.precio == null;
        const precio = sinPrecio ? "Sin precio" : formatearPrecio(prod.precio);
        const noDisponible = sinExistencias || sinPrecio;
        const html = `
            <article
                class="card-producto ${sinExistencias ? "card-sin-stock" : ""}"
                data-id="${prod.id}"
                data-nombre="${prod.nombre}"
                data-precio="${prod.precio ?? ""}"
                data-stock="${prod.stock ?? ""}"
                data-peso="${Boolean(prod.peso)}"
                data-unidad="${prod.unidadMedida ?? "u"}"
                data-categoria="${prod.categoria ?? ""}"
                aria-disabled="${noDisponible}"
            >
                
                <div class="card-detalles">
                <h3 class="producto-nombre">${prod.nombre}</h3>
                <span class="producto-categoria">${prod.categoria ?? ""}</span>
                <span class="producto-categoria">${!prod.peso ? `Unidades: ${prod.stock}` : `Peso: ${prod.stock} - ${prod.unidadMedida}`}</span>
                <div class="producto-footer">
                    <strong class="producto-precio">${precio}</strong>
                    <button type="button" class="btn-cantidad-catalogo ${prod.peso ? "btn-balanza-catalogo" : ""}" data-accion="abrir-modal-cantidad" aria-label="Cambiar cantidad" ${noDisponible ? "disabled" : ""}>
                    ${prod.peso ? '<i data-lucide="scale" aria-hidden="true"></i>' : ""}
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
