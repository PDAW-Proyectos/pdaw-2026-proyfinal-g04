export function crearCategoriasStore() {
    let categorias = [];

    return {
        listar: () => [...categorias],

        obtener(id) {
            return categorias.find((categoria) => categoria.id === Number(id));
        },

        establecerCategorias(nuevasCategorias) {
            categorias = [...nuevasCategorias];
        },

        agregar(categoria) {
            categorias.push(categoria);
        },

        actualizar(categoriaActualizada) {
            categorias = categorias.map((categoria) =>
                categoria.id === categoriaActualizada.id ? categoriaActualizada : categoria
            );
        },

        eliminar(id) {
            categorias = categorias.filter((categoria) => categoria.id !== Number(id));
        },
    };
}
