import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { iniciarSidebar } from "../../common/components/sidebar.js";
import { iniciarPrecios } from "../Precios/precios.page.js";
import { iniciarUsuarios } from "../Usuarios/usuarios.page.js";
import { iniciarFinanzas } from "../Finanzas/finanzas.page.js";
import { iniciarConfiguracion } from "../Configuracion/configuracion.page.js";
import { crearCategoriasStore } from "../Categorias/categorias.store.js";

document.addEventListener("DOMContentLoaded", async () => {
    const storeCategorias = crearCategoriasStore();

    iniciarSidebar();
    iniciarNavegacionVistas();

    iniciarFinanzas();
    iniciarUsuarios();
    iniciarConfiguracion(storeCategorias);
    await iniciarPrecios(storeCategorias);
});
