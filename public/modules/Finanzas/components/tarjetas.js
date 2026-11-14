export function crearTarjetas(datos) {
    return {
        actualizar(cardId, periodo, cardElement) {
            const data = datos[cardId]?.[periodo];

            if (!data || !cardElement) return;

            const valorElement = cardElement.querySelector(".card-valor");
            const tendenciaElement = cardElement.querySelector(".card-tendencia");

            if (valorElement) valorElement.style.opacity = 0;
            if (tendenciaElement) tendenciaElement.style.opacity = 0;

            setTimeout(() => {
                if (valorElement) {
                    valorElement.textContent = data.valor;
                    valorElement.style.opacity = 1;
                }
                if (tendenciaElement) {
                    tendenciaElement.textContent = data.tendencia;
                    tendenciaElement.className = `card-tendencia ${data.claseTendencia}`;
                    tendenciaElement.style.opacity = 1;
                }
            }, 150);
        },
    };
}
