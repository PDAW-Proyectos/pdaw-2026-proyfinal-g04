import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalApertura() {
    const modalApertura = document.getElementById("modal-inicio-turno");
    const inputsBilletes = document.querySelectorAll(".input-billete");
    const textoTotalApertura = document.getElementById("total-apertura");
    let turnoIniciado = false;

    const calcularTotalBilletes = () => {
        let total = 0;

        inputsBilletes.forEach((input) => {
            const cantidad = parseInt(input.value) || 0;
            const denominacion = parseInt(input.dataset.denominacion) || 0;
            total += cantidad * denominacion;
        });

        if (textoTotalApertura) {
            textoTotalApertura.textContent = formatearPrecio(total);
        }
    };

    const resetearApertura = () => {
        inputsBilletes.forEach((input) => {
            input.value = "";
        });
        calcularTotalBilletes();
    };

    inputsBilletes.forEach((input) => {
        input.addEventListener("input", calcularTotalBilletes);
    });

    const confirmarApertura = () => {
        const responsableNombre = document.getElementById("input-nombre-responsable").value;
        const idPerfil = document.getElementById("select-id-responsable").value;
        const totalStr = textoTotalApertura?.textContent || "$ 0,00";

        console.log(`Abriendo turno para ${responsableNombre} (${idPerfil}) con fondo inicial de ${totalStr}`);

        turnoIniciado = true;
        cerrarModalOverlay(modalApertura);
        alert(`Turno abierto correctamente con ${totalStr}`);

        const elNombreRol = document.getElementById("nombre-rol");
        const elHoraApertura = document.getElementById("hora-apertura");

        if (elNombreRol) elNombreRol.textContent = responsableNombre;

        if (elHoraApertura) {
            const horaActual = new Date().toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
            });
            elHoraApertura.textContent = `${horaActual} hs`;
        }
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-apertura"]')) {
            abrirModalOverlay(modalApertura);
            resetearApertura();
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-apertura"]')) {
            cerrarModalOverlay(modalApertura);
            return;
        }

        if (event.target.closest("#btn-confirmar-apertura")) {
            confirmarApertura();
            return;
        }

        if (event.target.closest("#btn-cancelar-apertura")) {
            window.location.href = "/login.html";
        }
    });

    if (!turnoIniciado && modalApertura) {
        setTimeout(() => {
            abrirModalOverlay(modalApertura);
            resetearApertura();
        }, 150);
    }
}
