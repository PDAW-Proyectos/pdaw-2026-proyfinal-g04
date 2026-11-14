import { datosMockCards, mockGraficos } from "./data/finanzas.mock.js";
import { crearTarjetas } from "./components/tarjetas.js";
import { crearGraficos } from "./components/graficos.js";

export function iniciarFinanzas() {
    const tarjetas = crearTarjetas(datosMockCards);
    const graficos = crearGraficos(mockGraficos);

    graficos.iniciar();

    document.addEventListener("change", (event) => {
        if (!event.target.classList.contains("filtro-card")) return;

        const select = event.target;
        const periodo = select.value;
        const cardId = select.getAttribute("data-card");
        const graficoId = select.getAttribute("data-grafico");

        if (cardId) {
            tarjetas.actualizar(cardId, periodo, select.closest(".card"));
        } else if (graficoId) {
            graficos.actualizar(graficoId, periodo);
        }
    });
}
