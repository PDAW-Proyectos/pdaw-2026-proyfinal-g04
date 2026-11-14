import { redondearPrecio } from "../../../common/utils/formato.js";

export function crearModalEditarProducto({ store, notificar }) {
    const modalStock = document.getElementById("modal-stock");
    const formStock = document.getElementById("form-stock");
    const btnCerrarModal = document.getElementById("cerrar-modal");
    const btnCancelarModal = document.getElementById("btn-cancelar-modal");
    const inputUsdModal = document.getElementById("modal-precio-usd");
    const inputArsModal = document.getElementById("modal-precio-ars");
    let productoEnEdicionId = null;

    [btnCerrarModal, btnCancelarModal].forEach((btn) => {
        if (btn) btn.addEventListener("click", () => modalStock?.close());
    });

    if (inputUsdModal && inputArsModal) {
        inputUsdModal.addEventListener("input", (event) => {
            const dolar = store.obtenerEstado().dolarApiEnVivo;
            if (!dolar) return;

            const valorUsd = parseFloat(event.target.value) || 0;
            inputArsModal.value = redondearPrecio(valorUsd * dolar);
        });
    }

    if (formStock) {
        formStock.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!productoEnEdicionId) return;

            const nuevoPrecioUsd = parseFloat(document.getElementById("modal-precio-usd").value);
            const nuevoPrecioArs = parseFloat(document.getElementById("modal-precio-ars").value);
            const nuevaDescripcion = document.getElementById("nueva-descripcion").value;

            try {
                await store.actualizarProducto(productoEnEdicionId, {
                    precioUsd: nuevoPrecioUsd,
                    precio: nuevoPrecioArs,
                    descripcion: nuevaDescripcion,
                });

                modalStock.close();
                notificar("¡Producto actualizado con éxito!");
            } catch (error) {
                console.error(error);
                notificar("Hubo un error al actualizar el producto.", true);
            }
        });
    }

    return {
        abrir(producto) {
            if (!producto || !modalStock) return;

            productoEnEdicionId = producto.id;
            document.getElementById("modal-producto-id").value = producto.id;
            document.getElementById("modal-nombre-producto").textContent = producto.nombre;
            document.getElementById("modal-precio-usd").value = producto.precioUsd;
            document.getElementById("modal-precio-ars").value = producto.precioArs;
            document.getElementById("nueva-descripcion").value = producto.descripcion || "";

            if (typeof modalStock.showModal === "function") {
                modalStock.showModal();
            }
        },
    };
}
