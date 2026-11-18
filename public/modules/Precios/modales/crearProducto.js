import { redondearPrecio } from "../../../common/utils/formato.js";

const cargarCategorias =  (storeCategorias, selectCategoria, notificar) => {
    try {
        const categorias = storeCategorias.listar();
        selectCategoria.innerHTML = '<option value="" disabled selected>Seleccione una categoría...</option>';
        categorias.forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando categorías:", error);
        notificar("Hubo un error al cargar las categorías.", true);
    }
}

export function crearModalCrearProducto({ store, storeCategorias, notificar }) {
    const modalCrear = document.getElementById("modal-crear-producto");
    const formCrear = document.getElementById("form-crear-producto");
    const btnCerrarCrear = document.getElementById("cerrar-modal-crear");
    const btnCancelarCrear = document.getElementById("btn-cancelar-crear");
    const btnAbrirModalCrear = document.querySelector('[data-nav="vista-crear"]') || document.getElementById("btn-nuevo-producto");
    const inputUsdCrear = document.getElementById("nuevo-prod-usd");
    const inputArsCrear = document.getElementById("nuevo-prod-ars");
    const selectCategoria = document.getElementById("nuevo-prod-categoria");

    if (btnAbrirModalCrear) {
        btnAbrirModalCrear.addEventListener("click", (event) => {
            event.preventDefault();
            if (formCrear) formCrear.reset();
            cargarCategorias(storeCategorias, selectCategoria, notificar);
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
                idCategoria: Number(selectCategoria.value),
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
