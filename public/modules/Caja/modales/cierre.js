import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalCierre({ store, api, notificar, alCerrar }) {
    const modalCierre = document.getElementById("modal-cierre");
    const modalSeleccion = document.getElementById("modal-seleccionar-caja-cierre");
    const listaCajas = document.getElementById("lista-cajas-abiertas-cierre");
    const inputEfectivoCierre = document.getElementById("input-efectivo-cierre");
    const inputObservaciones = document.getElementById("input-observaciones-cierre");
    const txtDiferenciaCierre = document.getElementById("txt-diferencia-cierre");
    const txtTotalVentas = document.getElementById("cierre-total-ventas");
    const txtMovimientos = document.getElementById("cierre-movimientos");
    const txtFechaHora = document.getElementById("cierre-fecha-hora");
    const nombreCajero = document.querySelector('[data-campo="nombre-cajero-cierre"]');
    let totalEsperado = Number(store.obtenerCaja()?.totalEsperado) || 0;
    let enviando = false;

    const obtenerTotalEsperado = () => totalEsperado;

    const calcularDiferencia = () => {
        const contado = parseFloat(inputEfectivoCierre?.value) || 0;
        const diferencia = contado - obtenerTotalEsperado();

        if (!txtDiferenciaCierre) return diferencia;

        txtDiferenciaCierre.textContent = formatearPrecio(diferencia);
        txtDiferenciaCierre.className = `diferencia-valor ${diferencia < 0 ? "texto-peligro" : "texto-ok"}`;

        return diferencia;
    };

    const actualizarResumen = (caja) => {
        const usuario = store.obtenerUsuario();
        const ventas = store.obtenerVentas();
        const movimientos = store.obtenerMovimientos();

        if (txtTotalVentas) {
            txtTotalVentas.textContent = formatearPrecio(
                ventas.reduce((total, venta) => total + (Number(venta.monto) || 0), 0)
            );
        }

        if (txtMovimientos) txtMovimientos.textContent = String(movimientos.length);

        if (txtFechaHora) {
            txtFechaHora.textContent = new Date().toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
            });
        }

        if (nombreCajero) {
            nombreCajero.textContent = usuario?.nombre ?? "el cajero";
        }

        if (caja && txtDiferenciaCierre) {
            totalEsperado = Number(caja.totalEsperado) || totalEsperado;
            calcularDiferencia();
        }
    };

    const abrirCierre = async (cajaSeleccionada = null) => {
        if (inputEfectivoCierre) inputEfectivoCierre.value = "";
        if (inputObservaciones) inputObservaciones.value = "";

        try {
            let caja = cajaSeleccionada;

            if (!caja) {
                const usuario = store.obtenerUsuario();
                const cajasAbiertas = await api.listarCajasAbiertas();
                caja = cajasAbiertas.find((item) =>
                    String(item.usuarioAbre) === String(usuario?.id) && item.estado === "abierta"
                );
            }

            if (!caja) {
                notificar("No hay una caja abierta para cerrar.", "error");
                return;
            }

            const cajaActualizada = await api.buscarCaja(caja.id);
            totalEsperado = Number(cajaActualizada.totalEsperado) || totalEsperado;
            store.abrirCaja({ ...caja, ...cajaActualizada });

            actualizarResumen(cajaActualizada);
            abrirModalOverlay(modalCierre);
            setTimeout(() => inputEfectivoCierre?.focus(), 100);
        } catch (error) {
            notificar(error.message, "error");
        }
    };

    const renderizarCajasAbiertas = (cajas) => {
        if (!listaCajas) return;

        if (!cajas.length) {
            listaCajas.innerHTML = `<p class="estado-vacio-pausa">No hay cajas abiertas</p>`;
            return;
        }

        listaCajas.innerHTML = cajas.map((caja) => `
            <button
                type="button"
                class="opcion-movimiento"
                data-accion="seleccionar-caja-cierre"
                data-id="${caja.id}"
            >
                <div class="opcion-texto">
                    <strong>Caja ${caja.nroCaja}</strong>
                    <span>Total esperado: ${formatearPrecio(caja.totalEsperado)}</span>
                </div>
                <i data-lucide="chevron-right" class="chevron-icono"></i>
            </button>
        `).join("");

        if (window.lucide) window.lucide.createIcons({ root: listaCajas });
    };

    const abrirSelector = async () => {
        if (!modalSeleccion) return;

        try {
            const usuario = store.obtenerUsuario();
            const cajasAbiertas = await api.listarCajasAbiertas();
            const cajasUsuario = cajasAbiertas.filter((caja) =>
                String(caja.usuarioAbre) === String(usuario?.id) && caja.estado === "abierta"
            );

            renderizarCajasAbiertas(cajasUsuario);
            abrirModalOverlay(modalSeleccion);
        } catch (error) {
            notificar(error.message, "error");
        }
    };

    const confirmarCierre = async () => {
        if (enviando) return;

        const caja = store.obtenerCaja();
        if (!caja) return;

        const totalContado = parseFloat(inputEfectivoCierre?.value);
        if (!Number.isFinite(totalContado) || totalContado < 0) {
            notificar("Ingresa un total contado valido.", "error");
            return;
        }

        enviando = true;
        try {
            const observaciones = inputObservaciones?.value.trim();
            const cajaCerrada = await api.cerrarCaja(caja.id, {
                totalContado,
                observaciones: observaciones ? [observaciones] : [],
            });

            cerrarModalOverlay(modalCierre);
            await alCerrar(cajaCerrada);
            notificar("Caja cerrada correctamente.");
        } catch (error) {
            notificar(error.message, "error");
        } finally {
            enviando = false;
        }
    };

    inputEfectivoCierre?.addEventListener("input", calcularDiferencia);

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-cierre"]')) {
            abrirCierre();
            return;
        }

        if (event.target.closest('[data-accion="abrir-modal-seleccionar-caja"]')) {
            abrirSelector();
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-cierre"]')) {
            cerrarModalOverlay(modalCierre);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-seleccionar-caja"]')) {
            cerrarModalOverlay(modalSeleccion);
            return;
        }

        const opcionCaja = event.target.closest('[data-accion="seleccionar-caja-cierre"]');
        if (opcionCaja) {
            const caja = { id: Number(opcionCaja.dataset.id) };
            cerrarModalOverlay(modalSeleccion);
            abrirCierre(caja);
            return;
        }

        if (event.target.closest('[data-accion="confirmar-cierre"]')) {
            confirmarCierre();
        }
    });

    return { abrirModal: abrirCierre, actualizarResumen, abrirSelector };
}
