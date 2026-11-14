export function crearFormStock({ api, notificar }) {
    const formStock = document.getElementById("form-alertas-stock");
    const inputCritico = document.getElementById("stock-critico");
    const inputMedio = document.getElementById("stock-medio");

    formStock.addEventListener("submit", async (event) => {
        event.preventDefault();

        const critico = Number(inputCritico.value);
        const medio = Number(inputMedio.value);

        if (!Number.isInteger(critico) || !Number.isInteger(medio) || critico < 0 || medio <= critico) {
            notificar("El stock crítico debe ser un entero no negativo y menor al stock medio", true);
            return;
        }

        try {
            await api.actualizar({ stock: { critico, medio } });
            notificar("Niveles de stock guardados");
        } catch (error) {
            console.error("Error guardando los niveles de stock:", error);
            notificar(error.message || "No se pudieron guardar los niveles", true);
        }
    });

    return {
        cargar(configuracion) {
            inputCritico.value = configuracion.stock.critico;
            inputMedio.value = configuracion.stock.medio;
        },
    };
}
