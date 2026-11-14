export function conectarFiltrosInventario({ inputBuscador, selectSemaforo, inputBuscadorProv, onFiltrarProductos, onFiltrarProveedores }) {
    if (inputBuscador) {
        inputBuscador.addEventListener("input", () => {
            onFiltrarProductos(inputBuscador.value, selectSemaforo?.value || "");
        });
    }

    if (selectSemaforo) {
        selectSemaforo.addEventListener("change", () => {
            onFiltrarProductos(inputBuscador?.value || "", selectSemaforo.value);
        });
    }

    if (inputBuscadorProv) {
        inputBuscadorProv.addEventListener("input", () => {
            onFiltrarProveedores(inputBuscadorProv.value);
        });
    }
}
