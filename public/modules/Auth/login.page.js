import { renderizarIconos } from "../../common/utils/iconos.js";
import { crearAuthApi } from "./auth.api.js";
import { iniciarSelectorRol } from "./components/selectorRol.js";
import { iniciarPasswordToggle } from "./components/passwordToggle.js";

function redirigirPorRol({ rol, rolSeleccionado }) {
    if (rol === "cajero" && rolSeleccionado === "cajero") {
        window.location.href = "/caja.html";
        return;
    }

    if (rol === "repositor" && rolSeleccionado === "repositor") {
        window.location.href = "/repositor.html";
        return;
    }

    if (rol === "admin") {
        if (rolSeleccionado === "cajero") {
            window.location.href = "/caja.html";
        } else if (rolSeleccionado === "repositor") {
            window.location.href = "/repositor.html";
        } else {
            window.location.href = "/admin.html";
        }
    }
}

export function iniciarLogin() {
    renderizarIconos();

    const api = crearAuthApi();
    const selectorRol = iniciarSelectorRol();
    const authForm = document.getElementById("auth-form");
    const mensajeError = document.getElementById("mensaje-login");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    iniciarPasswordToggle();

    if (!authForm) return;

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (mensajeError) mensajeError.textContent = "";

        const email = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const rolSeleccionado = selectorRol.obtenerRol();

        try {
            const data = await api.login({ email, password, rolSeleccionado });
            redirigirPorRol({ rol: data.rol, rolSeleccionado });
        } catch (error) {
            console.error(error);
            if (mensajeError) {
                mensajeError.textContent = error.message || "Error al conectar con el servidor";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", iniciarLogin);
