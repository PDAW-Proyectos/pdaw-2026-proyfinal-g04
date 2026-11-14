import { redondearPrecio } from "../../../common/utils/formato.js";
import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearDashboardPrecios() {
    const spanDolarSistema = document.getElementById("dolar-sistema-actual");
    const spanDolarVivo = document.getElementById("dolar-api-vivo");
    const spanAlertaDolar = document.getElementById("alerta-dolar");
    const spanEjemploNombre = document.getElementById("ejemplo-nombre");
    const spanEjemploViejo = document.getElementById("ejemplo-viejo");
    const spanEjemploNuevo = document.getElementById("ejemplo-nuevo");
    const btnGuardarCambios = document.getElementById("btn-guardar-cambios");
    const htmlOriginalBotonGuardar = btnGuardarCambios?.innerHTML || "";
    let estadoActual = null;

    const restaurarBoton = () => {
        if (!btnGuardarCambios || !htmlOriginalBotonGuardar) return;
        btnGuardarCambios.innerHTML = htmlOriginalBotonGuardar;
        btnGuardarCambios.style.backgroundColor = "";
        btnGuardarCambios.style.borderColor = "";
        btnGuardarCambios.style.color = "";
        renderizarIconos();
    };

    return {
        render(estado, simulacionMonto = null) {
            estadoActual = estado;

            if (spanDolarSistema) {
                spanDolarSistema.textContent = `$${estado.ultimoDolarGuardado || "---"}`;
            }

            if (spanAlertaDolar) {
                spanAlertaDolar.style.display = estado.dolarApiEnVivo && estado.ultimoDolarGuardado !== estado.dolarApiEnVivo ? "inline-block" : "none";
            }

            if (estado.catalogoBase.length > 0) {
                const prodBase = estado.catalogoBase[0];
                const prodBorrador = estado.catalogoEdicion[0];

                if (spanEjemploNombre) spanEjemploNombre.textContent = prodBase.nombre;
                if (spanEjemploViejo) {
                    spanEjemploViejo.textContent = `$ ${(prodBase.precioArs ?? 0).toLocaleString("es-AR")}`;
                }

                if (spanEjemploNuevo) {
                    if (simulacionMonto !== null) {
                        spanEjemploNuevo.textContent = `$ ${simulacionMonto.toLocaleString("es-AR")}`;
                        spanEjemploNuevo.style.color = "#759627";
                    } else if (estado.hayCambiosSinGuardar && prodBorrador) {
                        spanEjemploNuevo.textContent = `$ ${prodBorrador.precioArs.toLocaleString("es-AR")}`;
                        spanEjemploNuevo.style.color = "#059669";
                    } else if (estado.dolarApiEnVivo && estado.ultimoDolarGuardado !== estado.dolarApiEnVivo) {
                        const impactoDolar = redondearPrecio(prodBase.precioUsd * estado.dolarApiEnVivo);
                        spanEjemploNuevo.textContent = `$ ${impactoDolar.toLocaleString("es-AR")} (Por dólar)`;
                        spanEjemploNuevo.style.color = "#759627";
                    } else {
                        spanEjemploNuevo.textContent = "---";
                        spanEjemploNuevo.style.color = "#759627";
                    }
                }
            }

            if (btnGuardarCambios) {
                btnGuardarCambios.disabled = !estado.hayCambiosSinGuardar;

                if (estado.hayCambiosSinGuardar && htmlOriginalBotonGuardar) {
                    restaurarBoton();
                }
            }
        },

        actualizarDolarVivo(dolar) {
            if (spanDolarVivo) spanDolarVivo.textContent = `$ ${dolar}`;
        },

        mostrarErrorDolar() {
            if (spanDolarVivo) spanDolarVivo.textContent = "Error de red";
        },

        marcarPublicado() {
            if (!btnGuardarCambios) return;

            btnGuardarCambios.innerHTML = `<i data-lucide="check-circle"></i> ¡Precios Publicados!`;
            btnGuardarCambios.style.backgroundColor = "#c7ff3e";
            btnGuardarCambios.style.borderColor = "#c7ff3e";
            btnGuardarCambios.style.color = "#161615";

            setTimeout(() => {
                if (!estadoActual?.hayCambiosSinGuardar) restaurarBoton();
            }, 2500);
        },
    };
}
