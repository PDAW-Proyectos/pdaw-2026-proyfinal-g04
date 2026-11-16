import { mostrarToast } from "../../common/utils/alertas.js";
import { crearCategoriasApi } from "../Categorias/categorias.api.js";
import { crearConfiguracionApi } from "./configuracion.api.js";
import { crearFormNegocio } from "./components/formNegocio.js";
import { crearFormSesion } from "./components/formSesion.js";
import { crearFormStock } from "./components/formStock.js";
import { crearGridCategorias } from "../Categorias/components/gridCategorias.js";

export async function iniciarConfiguracion(storeCategorias) {
    const api = crearConfiguracionApi();
    const apiCategorias = crearCategoriasApi();
    const notificar = mostrarToast;

    const formNegocio = crearFormNegocio({ api, notificar });
    const formSesion = crearFormSesion({ api, notificar });
    const formStock = crearFormStock({ api, notificar });
    const gridCategorias = crearGridCategorias({ storeCategorias, apiCategorias, notificar });

    const formNuevaCategoria = document.getElementById("form-nueva-categoria");
    const inputNuevaCategoria = document.getElementById("nueva-categoria-nombre");

    formNuevaCategoria.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = inputNuevaCategoria.value.trim();
        if (!nombre) return;

        try {
            const resultado = await apiCategorias.crear(nombre);
            storeCategorias.agregar(resultado);
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
        const resultado = await apiCategorias.listar();
        storeCategorias.establecerCategorias(resultado.categorias);
        gridCategorias.renderizar();
    } catch (error) {
        console.error("Error cargando las categorías:", error);
        notificar(error.message || "No se pudieron cargar las categorías", true);
    }
}
