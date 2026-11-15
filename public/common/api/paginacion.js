export async function obtenerTodasLasPaginas({ solicitar, clave, limite = 50 }) {
    const resultados = [];
    let pagina = 1;

    while (true) {
        const respuesta = await solicitar(pagina, limite);
        const datos = respuesta?.[clave] ?? [];
        resultados.push(...datos);

        const totalPaginasRespuesta = Number(respuesta?.totalPaginas) || 1;
        pagina += 1;
        if (pagina > totalPaginasRespuesta) break;
    }

    return resultados;
}

export function crearUrlConPaginacion(base, pagina, limite) {
    return `${base}/?pagina=${pagina}&limite=${limite}`;
}
