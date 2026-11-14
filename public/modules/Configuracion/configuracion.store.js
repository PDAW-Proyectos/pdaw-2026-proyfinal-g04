export function crearConfiguracionStore() {
    let categorias = [];

    return {
        obtenerCategorias: () => [...categorias],

        establecerCategorias(nuevasCategorias) {
            categorias = [...nuevasCategorias];
        },

        agregarCategoria(categoria) {
            categorias.push(categoria);
        },

        eliminarCategoria(id) {
            categorias = categorias.filter((categoria) => String(categoria.id) !== String(id));
        },
    };
}
