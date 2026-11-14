import { renderizarIconos } from "../../../common/utils/iconos.js";

export function iniciarPasswordToggle() {
    const passwordInput = document.getElementById("password");
    const mostrarContrasena = document.getElementById("mostrar-contrasena");

    if (!passwordInput || !mostrarContrasena) return;

    mostrarContrasena.addEventListener("click", () => {
        const mostrar = passwordInput.type === "password";

        passwordInput.type = mostrar ? "text" : "password";
        mostrarContrasena.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");

        mostrarContrasena.innerHTML = `<i data-lucide="${mostrar ? "eye-off" : "eye"}" aria-hidden="true"></i>`;
        renderizarIconos();
    });
}
