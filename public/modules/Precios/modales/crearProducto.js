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
    const radioUnidad = document.getElementById("tipo-producto-unidad");
    const radioPeso = document.getElementById("tipo-producto-peso");
    const inputCantidad = document.getElementById("nuevo-prod-stock");
    const labelCantidad = document.getElementById("label-nuevo-prod-stock");
    const grupoUnidadMedida = document.getElementById("grupo-unidad-medida");
    const selectUnidadMedida = document.getElementById("nuevo-prod-unidad-medida");

    const actualizarCamposTipoProducto = () => {
        const esPorPeso = radioPeso?.checked === true;

        if (labelCantidad) {
            labelCantidad.textContent = esPorPeso
                ? "Peso inicial:"
                : "Stock inicial (Unidades):";
        }
        if (inputCantidad) {
            inputCantidad.step = esPorPeso ? "any" : "1";
        }
        if (grupoUnidadMedida) {
            grupoUnidadMedida.hidden = !esPorPeso;
        }
        if (selectUnidadMedida) {
            selectUnidadMedida.disabled = !esPorPeso;
            selectUnidadMedida.required = esPorPeso;
            if (!esPorPeso) selectUnidadMedida.value = "";
        }
    };

    actualizarCamposTipoProducto();

    [radioUnidad, radioPeso].forEach((radio) => {
        if (radio) radio.addEventListener("change", actualizarCamposTipoProducto);
    });

    if (btnAbrirModalCrear) {
        btnAbrirModalCrear.addEventListener("click", (event) => {
            event.preventDefault();
            if (formCrear) formCrear.reset();
            actualizarCamposTipoProducto();
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
        inputArsCrear.addEventListener("input", (event) => {
            const dolar = store.obtenerEstado().dolarApiEnVivo;
            if (!dolar) return;

            const valorArs = parseFloat(event.target.value) || 0;
            inputUsdCrear.value = Math.round(valorArs / dolar * 100) / 100;
        });
    }

    if (formCrear) {
        formCrear.addEventListener("submit", async (event) => {
            event.preventDefault();

            const esPorPeso = radioPeso?.checked === true;
            const valorCantidad = parseFloat(inputCantidad?.value) || 0;
            const campoCantidad = esPorPeso
                ? { peso: valorCantidad }
                : { unidad: parseInt(valorCantidad, 10) || 0 };

            const nuevoProducto = {
                nombre: document.getElementById("nuevo-prod-nombre").value,
                idCategoria: Number(selectCategoria.value),
                precioUsd: parseFloat(inputUsdCrear.value),
                ...campoCantidad,
                descripcion: document.getElementById("nuevo-prod-descripcion").value,
            };

            if (esPorPeso) {
                nuevoProducto.unidadMedida = selectUnidadMedida.value;
            }

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
