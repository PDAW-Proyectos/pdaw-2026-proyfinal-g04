export function crearModalStock({ store, onActualizado }) {
    const modalStock = document.getElementById("modal-stock");
    const formStock = document.getElementById("form-stock");
    const btnCerrarModal = document.getElementById("cerrar-modal");
    const btnCancelarModal = document.getElementById("btn-cancelar-modal");
    const spanNombreProducto = document.getElementById("modal-nombre-producto");
    const inputNuevoStock = document.getElementById("nuevo-stock");
    const inputNuevaDescripcion = document.getElementById("nueva-descripcion");
    const imgPreview = document.getElementById("modal-preview-foto");
    const inputNuevaFoto = document.getElementById("nueva-foto");
    const fotoPorDefecto = "https://via.placeholder.com/150?text=Sin+Foto";

    const cerrar = () => modalStock?.close();

    [btnCerrarModal, btnCancelarModal].forEach((btn) => {
        if (btn) btn.addEventListener("click", cerrar);
    });

    if (inputNuevaFoto && imgPreview) {
        inputNuevaFoto.addEventListener("change", (event) => {
            const archivo = event.target.files[0];
            if (!archivo) return;

            const objectUrl = URL.createObjectURL(archivo);
            imgPreview.src = objectUrl;
        });
    }

    if (formStock) {
        formStock.addEventListener("submit", (event) => {
            event.preventDefault();

            const idProducto = formStock.getAttribute("data-producto-id");
            const nuevoStock = parseInt(inputNuevoStock.value, 10);
            const nuevaDescripcion = inputNuevaDescripcion.value;
            const archivoFoto = inputNuevaFoto?.files[0];
            const cambios = { stock: nuevoStock, descripcion: nuevaDescripcion };

            if (archivoFoto) {
                cambios.foto = URL.createObjectURL(archivoFoto);
            }

            if (store.actualizarProducto(idProducto, cambios)) {
                onActualizado();
            }

            modalStock.close();
        });
    }

    return {
        abrir(producto) {
            if (!producto || !modalStock) return;

            spanNombreProducto.textContent = producto.nombre;
            inputNuevoStock.value = producto.stock;
            inputNuevaDescripcion.value = producto.descripcion;
            imgPreview.src = producto.foto || fotoPorDefecto;
            inputNuevaFoto.value = "";
            formStock.setAttribute("data-producto-id", producto.id);

            if (typeof modalStock.showModal === "function") {
                modalStock.showModal();
            }
        },
    };
}
