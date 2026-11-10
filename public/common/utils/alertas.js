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