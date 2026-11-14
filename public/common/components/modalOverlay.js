export function abrirModalOverlay(modal) {
    if (!modal) return;
    modal.classList.remove("modal-oculto");
    modal.setAttribute("aria-hidden", "false");
}

export function cerrarModalOverlay(modal) {
    if (!modal) return;
    modal.classList.add("modal-oculto");
    modal.setAttribute("aria-hidden", "true");
}

export function cerrarModalesAbiertos() {
    document.querySelectorAll(".modal-overlay:not(.modal-oculto)").forEach((modal) => cerrarModalOverlay(modal));
}
