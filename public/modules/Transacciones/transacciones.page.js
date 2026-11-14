import { crearTransaccionesStore } from "./transacciones.store.js";
import { historialBaseMock, ventasTurnoMock } from "./data/transacciones.mock.js";
import { crearTablaVentas } from "./components/tablaVentas.js";
import { crearTablaHistorial } from "./components/tablaHistorial.js";
import { crearFiltrosHistorial } from "./components/filtrosHistorial.js";
import { mostrarAntiguedad } from "./components/antiguedad.js";
import { iniciarModalMovimiento } from "./modales/movimiento.js";
import { iniciarModalHistorial } from "./modales/historial.js";

export function iniciarTransacciones() {
    const store = crearTransaccionesStore({
        ventas: ventasTurnoMock,
        historial: historialBaseMock,
    });

    const tablaVentas = crearTablaVentas({
        tbody: document.getElementById("lista-ventas-turno"),
    });

    const tablaHistorial = crearTablaHistorial({
        tbody: document.getElementById("lista-historial-completo"),
    });

    const renderizarVentas = (filtro = "Todos") => {
        tablaVentas.render(store.filtrarVentas(filtro));
    };

    const renderizarHistorial = (ventas) => {
        tablaHistorial.render(ventas);
    };

    document.addEventListener("click", (event) => {
        const chipFiltro = event.target.closest("#filtros-metodo-pago .chip");
        if (!chipFiltro) return;

        document.querySelectorAll("#filtros-metodo-pago .chip").forEach((chip) => chip.classList.remove("active"));
        chipFiltro.classList.add("active");
        renderizarVentas(chipFiltro.dataset.filtro);
    });

    renderizarVentas();

    const filtrosHistorial = crearFiltrosHistorial({
        store,
        onFiltrar: renderizarHistorial,
    });

    filtrosHistorial.filtrar();
    mostrarAntiguedad("2023-03-14T08:00:00");

    iniciarModalMovimiento();
    iniciarModalHistorial();
}
