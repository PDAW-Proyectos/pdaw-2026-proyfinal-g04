export function crearFormSesion({ api, notificar }) {
    const formSesion = document.getElementById("form-sesion");
    const inputTiempoInactividad = document.getElementById("tiempo-inactividad");

    formSesion.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const sessionDurationMinutes = Number(inputTiempoInactividad.value);
            await api.actualizar({ sessionDurationMinutes });
            notificar("Duración de sesión guardada");
        } catch (error) {
            console.error("Error guardando la duración de sesión:", error);
            notificar(error.message || "No se pudo guardar la duración", true);
        }
    });

    return {
        cargar(configuracion) {
            inputTiempoInactividad.value = String(configuracion.sessionDurationMinutes);
        },
    };
}
