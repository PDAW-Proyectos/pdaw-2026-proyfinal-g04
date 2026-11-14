import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalConsulta({ db, notificar }) {
    const modalConsulta = document.getElementById("modal-consulta");
    const inputConsulta = document.getElementById("input-consulta-codigo");
    const tarjetaResultado = document.getElementById("resultado-consulta");
    const tarjetaEspera = document.getElementById("espera-consulta");

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-consulta"]')) {
            abrirModalOverlay(modalConsulta);
            inputConsulta.value = "";
            tarjetaResultado.classList.add("oculto");
            tarjetaEspera.style.display = "block";
            setTimeout(() => inputConsulta.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-consulta"]')) {
            cerrarModalOverlay(modalConsulta);
        }
    });

    if (inputConsulta) {
        inputConsulta.addEventListener("keypress", (event) => {
            if (event.key !== "Enter") return;

            event.preventDefault();
            const codigo = inputConsulta.value.trim();
            if (!codigo) return;

            const producto = db.find((item) => item.sku === codigo);

            if (producto) {
                tarjetaEspera.style.display = "none";
                tarjetaResultado.classList.remove("oculto");

                document.getElementById("res-sku").textContent = producto.sku;
                document.getElementById("res-nombre").textContent = producto.nombre;
                document.getElementById("res-precio").textContent = formatearPrecio(producto.precio);

                const elStock = document.getElementById("res-stock");
                elStock.textContent = `Stock: ${producto.stock} un.`;
                elStock.className = "resultado-stock " + (producto.stock > 5 ? "stock-ok" : producto.stock > 0 ? "stock-bajo" : "stock-cero");
            } else {
                notificar("Producto no encontrado.", "error");
                tarjetaEspera.style.display = "block";
                tarjetaResultado.classList.add("oculto");
            }

            inputConsulta.value = "";
        });
    }
}
