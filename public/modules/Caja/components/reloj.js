export function iniciarRelojCaja() {
    const relojEl = document.getElementById("reloj-vivo");
    if (!relojEl) return;

    const actualizarHora = () => {
        relojEl.textContent = new Date().toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    actualizarHora();
    setInterval(actualizarHora, 1000);
}
