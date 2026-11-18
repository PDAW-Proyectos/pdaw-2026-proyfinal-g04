import { solicitarJson } from "../api/httpClient.js";

const EVENTO_DURACION_ACTUALIZADA = "sesion:duracion-actualizada";

export async function iniciarControlInactividad() {
    let duracionMs;
    try {
        ({ sessionExpiringTime: duracionMs } = await solicitarJson("/api/configuracion/sesion"));
    } catch (error) {
        console.error("No se pudo cargar la duración de sesión:", error);
        return;
    }

    if (!Number.isInteger(duracionMs) || duracionMs < 0) {
        console.error("El backend devolvió una duración de sesión inválida");
        return;
    }

    let temporizador;
    let ultimaRenovacion = Date.now();
    let cerrandoSesion = false;

    const cerrarSesion = async () => {
        if (cerrandoSesion) return;
        cerrandoSesion = true;
        clearTimeout(temporizador);

        try {
            const respuesta = await fetch("/api/auth/logout", { method: "POST" });
            if (!respuesta.ok) {
                console.error(`No se pudo cerrar la sesión: HTTP ${respuesta.status}`);
            }
        } catch (error) {
            console.error("No se pudo cerrar la sesión:", error);
        } finally {
            window.location.replace("/login.html");
        }
    };

    const renovarSesion = async () => {
        try {
            const respuesta = await fetch("/api/auth/me");
            if (respuesta.status === 401) {
                await cerrarSesion();
            } else if (!respuesta.ok) {
                console.error(`No se pudo renovar la sesión: HTTP ${respuesta.status}`);
            }
        } catch (error) {
            console.error("No se pudo renovar la sesión:", error);
        }
    };

    const programarCierre = () => {
        clearTimeout(temporizador);
        if (duracionMs > 0) {
            temporizador = setTimeout(cerrarSesion, duracionMs);
        }
    };

    const registrarActividad = () => {
        programarCierre();

        if (duracionMs === 0) return;

        const intervaloRenovacion = Math.min(duracionMs / 2, 60000);
        if (Date.now() - ultimaRenovacion >= intervaloRenovacion) {
            ultimaRenovacion = Date.now();
            void renovarSesion();
        }
    };

    for (const evento of ["pointerdown", "keydown", "mousemove", "scroll", "touchstart"]) {
        window.addEventListener(evento, registrarActividad, { passive: true });
    }

    window.addEventListener(EVENTO_DURACION_ACTUALIZADA, (evento) => {
        duracionMs = evento.detail;
        ultimaRenovacion = 0;
        programarCierre();
        void renovarSesion();
    });

    programarCierre();
}
