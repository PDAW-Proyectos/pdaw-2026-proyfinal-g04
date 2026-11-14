export function mostrarToast(mensaje, esError = false) {
    const toast = document.createElement("div");
    toast.textContent = mensaje;
    toast.className = `toast-notificacion ${esError ? "toast-error" : "toast-exito"}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-visible"));
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

export function mostrarNotificacion(mensaje, tipo = "info") {
    let contenedor = document.getElementById("contenedor-toasts");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-toasts";
        contenedor.className = "contenedor-toasts";
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement("div");
    toast.className = `toast-alerta ${tipo}`;

    const iconoStr = tipo === "error" ? "alert-triangle" : "info";
    toast.innerHTML = `
        <i data-lucide="${iconoStr}" aria-hidden="true"></i>
        <span>${mensaje}</span>
    `;

    contenedor.appendChild(toast);

    if (window.lucide) window.lucide.createIcons({ root: toast });

    setTimeout(() => {
        toast.classList.add("ocultar");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}
