export function crearFiltrosHistorial({ store, onFiltrar, onBuscarTicket }) {
    const chips = document.querySelectorAll("#filtros-tiempo-historial .chip-historial");
    const inputDesde = document.getElementById("input-fecha-desde");
    const inputHasta = document.getElementById("input-fecha-hasta");
    const textoDesde = document.getElementById("texto-fecha-desde");
    const textoHasta = document.getElementById("texto-fecha-hasta");
    const formulario =
        document.querySelector("#historial #form-lector-inicio") ??
        document.querySelector("#historial .lector-form");
    const buscador = formulario?.querySelector("input");

    const obtenerFiltros = () => {
        const chipActivo = document.querySelector("#filtros-tiempo-historial .chip-historial.activo");
        const desde = inputDesde?.value;
        const hasta = inputHasta?.value;

        if (desde || hasta) {
            return {
                desde: desde ? new Date(`${desde}T00:00:00`) : null,
                hasta: hasta ? new Date(`${hasta}T00:00:00`) : null,
            };
        }

        return store.obtenerRangoRapido(chipActivo?.dataset.filtro || "hoy");
    };

    const filtrar = () => {
        onFiltrar(obtenerFiltros());
    };

    formulario?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const termino = buscador?.value.trim() ?? "";
        await onBuscarTicket(termino);
    });

    document.addEventListener("click", (event) => {
        const chipHistorial = event.target.closest("#filtros-tiempo-historial .chip-historial");
        if (!chipHistorial) return;

        chips.forEach((chip) => chip.classList.remove("activo"));
        chipHistorial.classList.add("activo");

        if (textoDesde) {
            textoDesde.textContent = "Desde";
            textoDesde.style.color = "";
        }
        if (textoHasta) {
            textoHasta.textContent = "Hasta";
            textoHasta.style.color = "";
        }
        if (inputDesde) inputDesde.value = "";
        if (inputHasta) inputHasta.value = "";
        if (buscador) buscador.value = "";

        filtrar();
    });

    const formatearFechaElegida = (input, texto, placeholder) => {
        if (!input || !texto) return;

        const botonFecha = input.closest(".btn-fecha-historial");
        if (botonFecha) {
            botonFecha.addEventListener("click", (event) => {
                if (typeof input.showPicker !== "function") return;

                event.preventDefault();
                input.focus();
                input.showPicker();
            });
        }

        input.addEventListener("change", (event) => {
            const fecha = event.target.value;

            if (fecha) {
                const [, mes, dia] = fecha.split("-");
                texto.textContent = `${dia}/${mes}`;
                texto.style.color = "#161615";

                chips.forEach((chip) => chip.classList.remove("activo"));
            } else {
                texto.textContent = placeholder;
                texto.style.color = "";
            }

            filtrar();
        });
    };

    formatearFechaElegida(inputDesde, textoDesde, "Desde");
    formatearFechaElegida(inputHasta, textoHasta, "Hasta");

    return { filtrar, obtenerFiltros };
}
