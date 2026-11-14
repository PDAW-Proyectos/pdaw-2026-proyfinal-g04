export function crearModalEscaner({ store, onProductoEncontrado }) {
    const btnEscanear = document.getElementById("btn-escanear");
    const modalEscaner = document.getElementById("modal-escaner");
    const btnCerrarEscaner = document.getElementById("cerrar-escaner");
    const btnCancelarEscaner = document.getElementById("btn-cancelar-escaner");
    const formEscaner = document.getElementById("form-escaner");
    const inputCodigoBarras = document.getElementById("input-codigo-barras");
    const errorEscaner = document.getElementById("error-escaner");

    if (!btnEscanear || !modalEscaner) return;

    btnEscanear.addEventListener("click", () => {
        inputCodigoBarras.value = "";
        errorEscaner.style.display = "none";
        modalEscaner.showModal();
        setTimeout(() => inputCodigoBarras.focus(), 100);
    });

    [btnCerrarEscaner, btnCancelarEscaner].forEach((btn) => {
        if (btn) btn.addEventListener("click", () => modalEscaner.close());
    });

    if (formEscaner) {
        formEscaner.addEventListener("submit", (event) => {
            event.preventDefault();

            const codigoBuscado = inputCodigoBarras.value.trim().toLowerCase();
            const producto = store.buscarProducto(codigoBuscado);

            if (producto) {
                errorEscaner.style.display = "none";
                modalEscaner.close();
                onProductoEncontrado(producto);
            } else {
                errorEscaner.style.display = "block";
            }
        });
    }
}
