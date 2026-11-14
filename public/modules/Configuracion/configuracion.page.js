import { mostrarToast } from "../../common/utils/alertas.js";
import { crearConfiguracionApi } from "./configuracion.api.js";
import { crearConfiguracionStore } from "./configuracion.store.js";
import { crearFormNegocio } from "./components/formNegocio.js";
import { crearFormSesion } from "./components/formSesion.js";
import { crearFormStock } from "./components/formStock.js";
import { crearGridCategorias } from "./components/gridCategorias.js";

export async function iniciarConfiguracion() {
    const api = crearConfiguracionApi();
    const store = crearConfiguracionStore();
    const notificar = mostrarToast;

    const formNegocio = crearFormNegocio({ api, notificar });
    const formSesion = crearFormSesion({ api, notificar });
    const formStock = crearFormStock({ api, notificar });
    const gridCategorias = crearGridCategorias({ store, api, notificar });

    const formNuevaCategoria = document.getElementById("form-nueva-categoria");
    const inputNuevaCategoria = document.getElementById("nueva-categoria-nombre");

    formNuevaCategoria.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = inputNuevaCategoria.value.trim();
        if (!nombre) return;

        try {
            const resultado = await api.crearCategoria(nombre);
            store.agregarCategoria(resultado.categoria);
            inputNuevaCategoria.value = "";
            gridCategorias.renderizar();
            notificar("Categoría agregada");
        } catch (error) {
            console.error("Error creando la categoría:", error);
            notificar(error.message || "No se pudo crear la categoría", true);
        }
    });

    try {
        const { configuracion } = await api.obtener();
        formNegocio.cargar(configuracion);
        formSesion.cargar(configuracion);
        formStock.cargar(configuracion);
    } catch (error) {
        console.error("Error cargando la configuración:", error);
        notificar(error.message || "No se pudo cargar la configuración", true);
    }

    try {
        const resultado = await api.listarCategorias();
        store.establecerCategorias(resultado.categorias);
        gridCategorias.renderizar();
    } catch (error) {
        console.error("Error cargando las categorías:", error);
        notificar(error.message || "No se pudieron cargar las categorías", true);
    }
}
