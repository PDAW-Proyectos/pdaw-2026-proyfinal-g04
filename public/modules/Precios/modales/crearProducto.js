import { redondearPrecio } from "../../../common/utils/formato.js";

export function crearModalCrearProducto({ store, notificar }) {
    const modalCrear = document.getElementById("modal-crear-producto");
    const formCrear = document.getElementById("form-crear-producto");
    const btnCerrarCrear = document.getElementById("cerrar-modal-crear");
    const btnCancelarCrear = document.getElementById("btn-cancelar-crear");
    const btnAbrirModalCrear = document.querySelector('[data-nav="vista-crear"]') || document.getElementById("btn-nuevo-producto");
    const inputUsdCrear = document.getElementById("nuevo-prod-usd");
    const inputArsCrear = document.getElementById("nuevo-prod-ars");

    if (btnAbrirModalCrear) {
        btnAbrirModalCrear.addEventListener("click", (event) => {
            event.preventDefault();
            if (formCrear) formCrear.reset();
            if (modalCrear && typeof modalCrear.showModal === "function") {
                modalCrear.showModal();
            }
        });
    }

    [btnCerrarCrear, btnCancelarCrear].forEach((btn) => {
        if (btn) btn.addEventListener("click", () => modalCrear?.close());
    });

    if (inputUsdCrear && inputArsCrear) {
        inputUsdCrear.addEventListener("input", (event) => {
            const dolar = store.obtenerEstado().dolarApiEnVivo;
            if (!dolar) return;

            const valorUsd = parseFloat(event.target.value) || 0;
            inputArsCrear.value = redondearPrecio(valorUsd * dolar);
        });
    }

    if (formCrear) {
        formCrear.addEventListener("submit", async (event) => {
            event.preventDefault();

            const nuevoProducto = {
                nombre: document.getElementById("nuevo-prod-nombre").value,
                categoria: document.getElementById("nuevo-prod-categoria").value,
                precioUsd: parseFloat(inputUsdCrear.value),
                precio: parseFloat(inputArsCrear.value),
                unidad: parseInt(document.getElementById("nuevo-prod-stock").value) || 0,
                descripcion: document.getElementById("nuevo-prod-descripcion").value,
            };

            try {
                await store.crearProducto(nuevoProducto);
                modalCrear.close();
                notificar("¡Producto creado y guardado con éxito!");
            } catch (error) {
                console.error(error);
                notificar("Hubo un error al crear el producto.", true);
            }
        });
    }
}
