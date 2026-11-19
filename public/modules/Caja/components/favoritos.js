import { formatearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function renderizarFavoritos(articulos) {
  const contenedor = document.getElementById("contenedor-favoritos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  articulos.forEach((prod) => {
    const sinExistencias = Number(prod.stock) <= 0;
    const precio = prod.precio == null ? "Sin precio" : formatearPrecio(prod.precio);
    const html = `
            <article
            class="card-producto-favorito ${sinExistencias ? "card-sin-stock" : ""}"
                data-accion="agregar-al-carrito"
                data-id="${prod.id}"
                data-nombre="${prod.nombre}"
                data-precio="${prod.precio ?? ""}"
                data-stock="${prod.stock ?? ""}"
                data-peso="${Boolean(prod.peso)}"
                data-unidad="${prod.unidadMedida ?? "u"}"
            >
               
                <div class="card-info">
                <h3>${prod.nombre}</h3>
                <span class="producto-categoria">${prod.categoria ?? ""}</span>
                <strong class="precio-destacado">${precio}</strong>
                </div>
                <i data-lucide="star" class="icono-estrella-top" aria-hidden="true"></i>
            </article>
        `;
    contenedor.insertAdjacentHTML("beforeend", html);
  });

  renderizarIconos(contenedor);
}
