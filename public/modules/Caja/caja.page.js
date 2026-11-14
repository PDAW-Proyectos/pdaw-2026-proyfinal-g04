import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { mostrarNotificacion } from "../../common/utils/alertas.js";
import { renderizarIconos } from "../../common/utils/iconos.js";
import { crearCajaStore } from "./caja.store.js";
import { articulosCatalogoMock, articulosFrecuentesMock, dbConsultaPrueba } from "./data/catalogo.mock.js";
import { renderizarFavoritos } from "./components/favoritos.js";
import { renderizarGrillaPrincipal } from "./components/catalogo.js";
import { iniciarRelojCaja } from "./components/reloj.js";
import { configurarAtajosTeclado } from "./components/atajos.js";
import { crearModalPausa } from "./modales/pausa.js";
import { iniciarModalDescuento } from "./modales/descuento.js";
import { iniciarModalConsulta } from "./modales/consulta.js";
import { iniciarModalCantidad } from "./modales/cantidad.js";
import { iniciarModalApertura } from "./modales/apertura.js";
import { iniciarModalCierre } from "./modales/cierre.js";
import { iniciarTransacciones } from "../Transacciones/transacciones.page.js";

export function iniciarCaja() {
    renderizarIconos();

    const store = crearCajaStore();

    renderizarFavoritos(articulosFrecuentesMock);
    renderizarGrillaPrincipal(articulosCatalogoMock);

    iniciarNavegacionVistas({
        selectorVistas: ".vista-tab",
        claseActivaVista: "activa",
    });

    iniciarRelojCaja();
    configurarAtajosTeclado();

    crearModalPausa({ store });
    iniciarModalDescuento({ store, notificar: mostrarNotificacion });
    iniciarModalConsulta({ db: dbConsultaPrueba, notificar: mostrarNotificacion });
    iniciarModalCantidad({ store, notificar: mostrarNotificacion });
    iniciarModalApertura();
    iniciarModalCierre();

    document.addEventListener("click", (event) => {
        const btnAgregar = event.target.closest('[data-accion="agregar-al-carrito"]');
        if (!btnAgregar) return;

        store.agregarProducto({
            id: Number(btnAgregar.dataset.id),
            nombre: btnAgregar.dataset.nombre,
            precio: parseFloat(btnAgregar.dataset.precio),
        });

        mostrarNotificacion(`${btnAgregar.dataset.nombre} agregado a la venta.`);
    });

    iniciarTransacciones();
}

document.addEventListener("DOMContentLoaded", iniciarCaja);
