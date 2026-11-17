import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalApertura({ store, api, notificar, cajas = [], alAbrir, obtenerCajaSeleccionada }) {
    const modalApertura = document.getElementById("modal-inicio-turno");
    const inputsBilletes = document.querySelectorAll(".input-billete");
    const textoTotalApertura = document.getElementById("total-apertura");
    const selectNroCaja = document.getElementById("select-nro-caja");
    const btnConfirmar = document.getElementById("btn-confirmar-apertura");
    let cajasConfiguradas = [...cajas];
    let enviando = false;

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

        return total;
    };

    const actualizarOpciones = () => {
        if (!selectNroCaja) return;

        const abiertas = new Set(
            store.obtenerCajasAbiertas().map((caja) => String(caja.nroCaja).trim())
        );

        selectNroCaja.innerHTML = "";

        const disponibles = cajasConfiguradas.filter((caja) => {
            const nombre = String(caja.nombre ?? caja).trim();
            return !abiertas.has(nombre);
        });

        if (!disponibles.length) {
            const opcion = document.createElement("option");
            opcion.value = "";
            opcion.textContent = "No hay cajas disponibles";
            opcion.disabled = true;
            selectNroCaja.appendChild(opcion);
            if (btnConfirmar) btnConfirmar.disabled = true;
            return;
        }

        disponibles.forEach((caja) => {
            const nombre = String(caja.nombre ?? caja).trim();
            const opcion = document.createElement("option");
            opcion.value = nombre;
            opcion.textContent = nombre;
            selectNroCaja.appendChild(opcion);
        });

        const seleccionada = obtenerCajaSeleccionada?.();
        if (seleccionada && [...selectNroCaja.options].some((opcion) => opcion.value === seleccionada)) {
            selectNroCaja.value = seleccionada;
        } else if (selectNroCaja.options.length) {
            selectNroCaja.selectedIndex = 0;
        }
        if (btnConfirmar) btnConfirmar.disabled = false;
    };

    const actualizarOpcionesCajas = (nuevasCajas) => {
        cajasConfiguradas = [...(nuevasCajas ?? [])];
        actualizarOpciones();
    };

    const resetearApertura = () => {
        inputsBilletes.forEach((input) => {
            input.value = "";
        });
        calcularTotalBilletes();
        actualizarOpciones();
    };

    const abrirModal = () => {
        resetearApertura();
        const seleccionada = obtenerCajaSeleccionada?.();
        if (seleccionada && selectNroCaja && [...selectNroCaja.options].some((opcion) => opcion.value === seleccionada)) {
            selectNroCaja.value = seleccionada;
        }
        abrirModalOverlay(modalApertura);
        setTimeout(() => inputsBilletes[0]?.focus(), 100);
    };

    const confirmarApertura = async () => {
        if (enviando || !selectNroCaja) return;

        const opcionSeleccionada = selectNroCaja.value || selectNroCaja.options[0]?.value;
        const nroCaja = String(opcionSeleccionada ?? "").trim();
        const montoInicial = calcularTotalBilletes();

        if (!nroCaja) {
            notificar("Selecciona una caja fisica valida.", "error");
            return;
        }

        enviando = true;
        if (btnConfirmar) btnConfirmar.disabled = true;

        try {
            const caja = await api.crearCaja({ nroCaja, montoInicial });
            await alAbrir(caja);
            cerrarModalOverlay(modalApertura);
            notificar(`Caja ${nroCaja} abierta correctamente.`);
        } catch (error) {
            notificar(error.message, "error");
        } finally {
            enviando = false;
            if (btnConfirmar) btnConfirmar.disabled = false;
        }
    };

    inputsBilletes.forEach((input) => {
        input.addEventListener("input", calcularTotalBilletes);
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-apertura"]')) {
            abrirModal();
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

    return { abrirModal, actualizarOpciones, actualizarOpcionesCajas };
}
