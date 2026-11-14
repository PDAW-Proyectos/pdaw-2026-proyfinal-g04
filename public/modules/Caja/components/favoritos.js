import { formatearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function renderizarFavoritos(articulos) {
    const contenedor = document.getElementById("contenedor-favoritos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    articulos.forEach((prod) => {
        const html = `
            <article class="card-producto-favorito" data-accion="agregar-al-carrito" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
                <div class="card-imagen">
                <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
                </div>
                <div class="card-info">
                <h3>${prod.nombre}</h3>
                <strong class="precio-destacado">${formatearPrecio(prod.precio)}</strong>
                </div>
                <i data-lucide="star" class="icono-estrella-top" aria-hidden="true"></i>
            </article>
        `;
        contenedor.insertAdjacentHTML("beforeend", html);
    });

    renderizarIconos(contenedor);
}
