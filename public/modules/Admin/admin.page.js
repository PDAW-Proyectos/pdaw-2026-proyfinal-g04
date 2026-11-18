import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { iniciarSidebar } from "../../common/components/sidebar.js";
import { iniciarPrecios } from "../Precios/precios.page.js";
import { iniciarUsuarios } from "../Usuarios/usuarios.page.js";
import { iniciarFinanzas } from "../Finanzas/finanzas.page.js";
import { iniciarConfiguracion } from "../Configuracion/configuracion.page.js";
import { crearCategoriasStore } from "../Categorias/categorias.store.js";
import { iniciarPerfil } from "../Perfil/perfil.page.js";
import { iniciarControlInactividad } from "../../common/utils/sesionInactividad.js";

document.addEventListener("DOMContentLoaded", async () => {
    void iniciarControlInactividad();
    const storeCategorias = crearCategoriasStore();

    iniciarSidebar();
    iniciarNavegacionVistas();
    iniciarPerfil();
    iniciarFinanzas();
    iniciarUsuarios();
    iniciarConfiguracion(storeCategorias);
    await iniciarPrecios(storeCategorias);
});
