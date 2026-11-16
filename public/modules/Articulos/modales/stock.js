import { mostrarToast } from "../../../common/utils/alertas.js";

export function crearModalStock({ onGuardar }) {
    const modalStock = document.getElementById("modal-stock");
    const formStock = document.getElementById("form-stock");
    const btnCerrarModal = document.getElementById("cerrar-modal");
    const btnCancelarModal = document.getElementById("btn-cancelar-modal");
    const spanNombreProducto = document.getElementById("modal-nombre-producto");
    const inputNuevoStock = document.getElementById("nuevo-stock");
    const inputNuevaDescripcion = document.getElementById("nueva-descripcion");
    const cerrar = () => modalStock?.close();

    [btnCerrarModal, btnCancelarModal].forEach((btn) => {
        if (btn) btn.addEventListener("click", cerrar);
    });

    if (formStock) {
        formStock.addEventListener("submit", async (event) => {
            event.preventDefault();

            const idProducto = formStock.getAttribute("data-producto-id");
            const nuevoStock = Number(inputNuevoStock.value);
            const nuevaDescripcion = inputNuevaDescripcion.value;

            if (!Number.isFinite(nuevoStock) || nuevoStock < 0) {
                mostrarToast("El stock debe ser un número no negativo", true);
                return;
            }

            try {
                await onGuardar(idProducto, { stock: nuevoStock, descripcion: nuevaDescripcion });
                mostrarToast("Producto actualizado correctamente");
                modalStock.close();
            } catch (error) {
                console.error("Error actualizando el producto:", error);
                mostrarToast("No se pudo actualizar el producto", true);
            }
        });
    }

    return {
        abrir(producto) {
            if (!producto || !modalStock) return;

            spanNombreProducto.textContent = producto.nombre;
            inputNuevoStock.value = producto.stock;
            inputNuevaDescripcion.value = producto.descripcion;
            formStock.setAttribute("data-producto-id", producto.id);

            if (typeof modalStock.showModal === "function") {
                modalStock.showModal();
            }
        },
    };
}
