import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalConsulta({ api, notificar }) {
    const modalConsulta = document.getElementById("modal-consulta");
    const inputConsulta = document.getElementById("input-consulta-codigo");
    const tarjetaResultado = document.getElementById("resultado-consulta");
    const tarjetaEspera = document.getElementById("espera-consulta");

    const mostrarEspera = () => {
        tarjetaResultado?.classList.add("oculto");
        if (tarjetaEspera) tarjetaEspera.style.display = "block";
    };

    const buscarProducto = async () => {
        const codigo = inputConsulta?.value.trim();
        if (!codigo) return;

        const id = Number(codigo);
        if (!Number.isInteger(id) || id < 1) {
            notificar("Ingresa un codigo de producto valido.", "error");
            return;
        }

        try {
            const producto = await api.buscarProducto(id);
            const precio = Number(producto.precioUsd) * Number(producto.cotizacion);

            if (document.getElementById("res-sku")) {
                document.getElementById("res-sku").textContent = `#${producto.id}`;
            }
            if (document.getElementById("res-nombre")) {
                document.getElementById("res-nombre").textContent = producto.nombre;
            }
            if (document.getElementById("res-precio")) {
                document.getElementById("res-precio").textContent = formatearPrecio(precio);
            }

            const elStock = document.getElementById("res-stock");
            if (elStock) {
                const stock = producto.peso !== undefined ? producto.peso : producto.unidad;
                const unidad = producto.peso !== undefined ? "kg" : "un.";
                elStock.textContent = `Stock: ${stock} ${unidad}`;
                elStock.className = `resultado-stock ${
                    producto.stock > 5 ? "stock-ok" : producto.stock > 0 ? "stock-bajo" : "stock-cero"
                }`;
            }

            if (tarjetaEspera) tarjetaEspera.style.display = "none";
            tarjetaResultado?.classList.remove("oculto");
        } catch (error) {
            notificar(error.message, "error");
            mostrarEspera();
        }

        if (inputConsulta) inputConsulta.value = "";
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-consulta"]')) {
            abrirModalOverlay(modalConsulta);
            if (inputConsulta) inputConsulta.value = "";
            mostrarEspera();
            setTimeout(() => inputConsulta?.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-consulta"]')) {
            cerrarModalOverlay(modalConsulta);
        }
    });

    inputConsulta?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        buscarProducto();
    });
}
