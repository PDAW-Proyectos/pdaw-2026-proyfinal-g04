export function crearHistorialApi() {
    return {
        async listar({ pagina = 1, limite = 10, tipo = "", nombreProducto = "" } = {}) {
            const params = new URLSearchParams({
                pagina: String(pagina),
                limite: String(limite),
            });

            if (tipo) params.set("tipo", tipo);
            if (nombreProducto) params.set("nombreProducto", nombreProducto);

            const res = await fetch(`/api/movimientos-stock?${params.toString()}`, {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("No se pudo cargar el historial de movimientos");
            }

            return await res.json();
        },
    };
}
