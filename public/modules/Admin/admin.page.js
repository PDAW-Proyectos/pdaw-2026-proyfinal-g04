import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { iniciarSidebar } from "../../common/components/sidebar.js";
import { iniciarPrecios } from "../Precios/precios.page.js";
import { iniciarUsuarios } from "../Usuarios/usuarios.page.js";
import { iniciarFinanzas } from "../Finanzas/finanzas.page.js";
import { iniciarConfiguracion } from "../Configuracion/configuracion.page.js";

document.addEventListener("DOMContentLoaded", async () => {
    iniciarSidebar();
    iniciarNavegacionVistas();

    iniciarFinanzas();
    iniciarUsuarios();
    iniciarConfiguracion();
    await iniciarPrecios();
});
