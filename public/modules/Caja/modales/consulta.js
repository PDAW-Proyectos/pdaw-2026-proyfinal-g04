import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalConsulta({ api, store, configuracionApi, notificar }) {
    const modalConsulta = document.getElementById("modal-consulta");
    const inputConsulta = document.getElementById("input-consulta-codigo");
    const tarjetaResultado = document.getElementById("resultado-consulta");
    const tarjetaEspera = document.getElementById("espera-consulta");
    let umbralesStock = { critico: 5, medio: 10 };

    const mostrarEspera = () => {
        tarjetaResultado?.classList.add("oculto");
        if (tarjetaEspera) tarjetaEspera.style.display = "block";
    };

    const buscarProducto = () => {
        const termino = inputConsulta?.value.trim().toLowerCase();
        if (!termino) {
            mostrarEspera();
            return;
        }

        const producto = store?.obtenerProductos().find((item) => {
            const nombre = String(item.nombre ?? "").toLowerCase();
            const id = String(item.id ?? "");
            const codigoBarras = String(
                item.codigoBarras ?? item.codigo ?? item.sku ?? "",
            ).toLowerCase();

            return (
                nombre.includes(termino)
                || id === termino
                || codigoBarras === termino
            );
        });

        if (!producto) {
            mostrarEspera();
            return;
        }

        const stock = Number(producto.stock ?? producto.peso ?? producto.unidad ?? 0);
        const unidad = producto.peso !== undefined ? "kg" : "un.";
        const codigoBarras =
            producto.codigoBarras ?? producto.codigo ?? producto.sku ?? "---";

        document.getElementById("res-nombre").textContent = producto.nombre;
        document.getElementById("res-precio").textContent =
            producto.precio == null ? "Sin precio" : formatearPrecio(producto.precio);

        const badgeStock = document.getElementById("res-stock-badge");
        if (badgeStock) {
            badgeStock.textContent =
                `Stock: ${Number.isFinite(stock) ? stock : "--"} ${unidad}`;
            if (stock <= umbralesStock.critico) {
                badgeStock.className = "badge-stock-critico";
            } else if (stock <= umbralesStock.medio) {
                badgeStock.className = "badge-stock-bajo";
            } else {
                badgeStock.className = "badge-stock-ok";
            }
        }

        const categoria = document.getElementById("res-categoria");
        if (categoria) categoria.textContent = producto.categoria || "Sin categoría";

        const id = document.getElementById("res-id");
        if (id) id.textContent = `#${String(producto.id).padStart(4, "0")}`;

        const codigo = document.getElementById("res-codigo-barras");
        if (codigo) codigo.textContent = codigoBarras;

        if (tarjetaEspera) tarjetaEspera.style.display = "none";
        tarjetaResultado?.classList.remove("oculto");
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-consulta"]')) {
            abrirModalOverlay(modalConsulta);
            if (inputConsulta) inputConsulta.value = "";
            mostrarEspera();
            configuracionApi?.obtener()
                .then((respuesta) => {
                    const stockConfigurado = respuesta?.configuracion?.stock ?? respuesta?.stock;
                    if (stockConfigurado) umbralesStock = stockConfigurado;
                })
                .catch((error) => {
                    console.error("No se pudieron cargar los umbrales de stock:", error);
                });
            setTimeout(() => inputConsulta?.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-consulta"]')) {
            cerrarModalOverlay(modalConsulta);
        }
    });

    inputConsulta?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        buscarProducto();
    });

    inputConsulta?.addEventListener("input", buscarProducto);
}
