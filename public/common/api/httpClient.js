export async function solicitarJson(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers,
        },
    });

    if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({}));
        throw new Error(error.detail || error.message || error.error || `Error HTTP ${respuesta.status}`);
    }

    return respuesta.status === 204 ? null : respuesta.json();
}
