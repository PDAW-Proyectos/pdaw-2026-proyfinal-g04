import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { mostrarNotificacion } from "../../common/utils/alertas.js";
import { renderizarIconos } from "../../common/utils/iconos.js";
import { formatearPrecio } from "../../common/utils/formato.js";
import { crearCajaStore } from "./caja.store.js";
import { crearCajaApi } from "./caja.api.js";
import { crearTransaccionesApi } from "../Transacciones/transacciones.api.js";
import { crearAuthApi } from "../Auth/auth.api.js";
import { crearConfiguracionApi } from "../Configuracion/configuracion.api.js";
import { crearUsuariosApi } from "../Usuarios/usuarios.api.js";
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
import { iniciarModalMovimiento } from "../Transacciones/modales/movimiento.js";
import { crearTablaVentas } from "../Transacciones/components/tablaVentas.js";
import { crearTablaHistorial } from "../Transacciones/components/tablaHistorial.js";
import { crearFiltrosHistorial } from "../Transacciones/components/filtrosHistorial.js";

const transformarProducto = (producto, categoriasPorId) => {
    const precio = Number(producto.precioUsd) * Number(producto.cotizacion);

    if (!Number.isFinite(precio) || precio <= 0) return null;

    return {
        ...producto,
        precio,
        stock: producto.unidad ?? producto.peso ?? null,
        peso: producto.peso !== undefined,
        unidadMedida: producto.peso !== undefined ? "kg" : "u",
        categoria: categoriasPorId.get(Number(producto.idCategoria)) ?? "Sin categoria",
    };
};

export function iniciarCaja() {
    renderizarIconos();

    const store = crearCajaStore();
    const api = crearCajaApi();
    const authApi = crearAuthApi();
    const transaccionesApi = crearTransaccionesApi();
    const configuracionApi = crearConfiguracionApi();
    const usuariosApi = crearUsuariosApi();
    let usuariosPorId = new Map();
    const notificar = mostrarNotificacion;

    const tablaVentas = crearTablaVentas({
        tbody: document.getElementById("lista-ventas-turno"),
    });

    const tablaHistorial = crearTablaHistorial({
        tbody: document.getElementById("lista-historial-completo"),
    });

    const renderizarCarrito = (estado) => {
        const contenedor = document.getElementById("carrito-productos");
        if (!contenedor) return;

        if (!estado.carrito.length) {
            contenedor.className = "cobro-vacio";
            contenedor.innerHTML = `
                <i data-lucide="shopping-basket" aria-hidden="true"></i>
                <h3>Tu venta esta vacia</h3>
                <p>Elegi productos del catalogo para comenzar.</p>
            `;
            renderizarIconos(contenedor);
            return;
        }

        contenedor.className = "carrito-lista";
        contenedor.innerHTML = estado.carrito.map((item) => `
            <article class="carrito-item" data-id="${item.id}">
                <div class="carrito-item-info">
                    <strong>${item.nombre}</strong>
                    <span>${item.cantidad} ${item.unidadMedida} x ${formatearPrecio(item.precio)}</span>
                </div>
                <strong>${formatearPrecio(item.precio * item.cantidad)}</strong>
                <button type="button" class="btn-tabla-accion" data-accion="quitar-producto" data-id="${item.id}">Quitar</button>
            </article>
        `).join("");
        renderizarIconos(contenedor);
    };

    const actualizarResumen = (estado) => {
        const subtotal = estado.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
        const ajuste = store.montoAjuste();
        const total = store.total();

        const elementoSubtotal = document.getElementById("subtotal-venta");
        const elementoDescuento = document.getElementById("descuento-venta");
        const elementoTotal = document.getElementById("total-venta");
        const elementoContador = document.getElementById("cantidad-productos");
        const elementoEtiqueta = document.getElementById("etiqueta-ajuste");
        const botonCobrar = document.getElementById("boton-cobrar");

        if (elementoSubtotal) elementoSubtotal.textContent = formatearPrecio(subtotal);
        if (elementoDescuento) elementoDescuento.textContent = formatearPrecio(ajuste);
        if (elementoTotal) elementoTotal.textContent = formatearPrecio(total);
        if (elementoContador) elementoContador.textContent = String(store.cantidadItems());
        if (elementoEtiqueta) {
            elementoEtiqueta.textContent = estado.modificador.tipo === "recargo" ? "Recargo" : "Descuento";
        }

        if (botonCobrar) {
            botonCobrar.disabled = !store.puedeCobrar();
        }
    };

    const actualizarEstadoCaja = (estado) => {
        const usuario = estado.usuario;
        const caja = estado.caja;
        const nombre = usuario?.nombre ?? "Cajero";
        const apellido = usuario?.apellido ?? "";
        const nombreCompleto = `${nombre} ${apellido}`.trim();

        document.querySelectorAll('[data-campo="nombre-cajero"]').forEach((elemento) => {
            elemento.textContent = nombreCompleto || "Cajero";
        });

        const nombreCierre = document.querySelector('[data-campo="nombre-cajero-cierre"]');
        if (nombreCierre) nombreCierre.textContent = nombreCompleto || "el cajero";

        const horaApertura = caja?.fechaApertura
            ? new Date(caja.fechaApertura).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
            : "--:--";

        document.querySelectorAll('[data-campo="hora-apertura"]').forEach((elemento) => {
            elemento.textContent = horaApertura;
        });

        const estadoTexto = caja ? "Caja abierta" : "Caja cerrada";
        document.querySelectorAll('[data-campo="estado-caja"]').forEach((elemento) => {
            elemento.textContent = estadoTexto;
        });
    };

    const actualizarPerfil = (estado) => {
        const usuario = estado.usuario;
        const caja = estado.caja;
        const nombreCompleto = `${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`.trim() || "Cajero";

        document.querySelectorAll('[data-campo="perfil-nombre"]').forEach((elemento) => {
            elemento.textContent = nombreCompleto;
        });

        const email = document.getElementById("perfil-email");
        if (email) email.textContent = usuario?.email ?? "";

        const rol = document.getElementById("perfil-rol");
        if (rol) rol.textContent = usuario?.rol ?? "--";

        const nombreCompletoEl = document.getElementById("perfil-nombre-completo");
        if (nombreCompletoEl) nombreCompletoEl.textContent = nombreCompleto;

        const cajaActual = document.getElementById("perfil-caja");
        if (cajaActual) cajaActual.textContent = caja ? `Caja ${caja.nroCaja}` : "Sin caja";
    };

    const actualizarUltimasVentas = (estado) => {
        tablaVentas.render((estado.ventas ?? []).slice(0, 5));
    };

    const actualizarArqueo = (estado) => {
        const caja = estado.caja;
        const fondo = document.getElementById("arqueo-fondo-inicial");
        const ingresos = document.getElementById("arqueo-ingresos");
        const egresos = document.getElementById("arqueo-egresos");
        const tbody = document.getElementById("lista-movimientos-turno");

        if (fondo) fondo.textContent = formatearPrecio(caja?.montoInicial ?? 0);

        const movimientos = estado.movimientos ?? [];
        const totalIngresos = movimientos
            .filter((movimiento) => Number(movimiento.monto) > 0)
            .reduce((total, movimiento) => total + Number(movimiento.monto), 0);
        const totalEgresos = movimientos
            .filter((movimiento) => Number(movimiento.monto) < 0)
            .reduce((total, movimiento) => total + Math.abs(Number(movimiento.monto)), 0);

        if (ingresos) ingresos.textContent = `+ ${formatearPrecio(totalIngresos)}`;
        if (egresos) egresos.textContent = `- ${formatearPrecio(totalEgresos)}`;

        if (tbody) {
            tbody.innerHTML = "";

              if (!movimientos.length) {
                  tbody.innerHTML = `<tr><td colspan="4">No hay datos</td></tr>`;
                  return;
              }

              movimientos.forEach((movimiento) => {
                  const esIngreso = Number(movimiento.monto) > 0;
                  const responsable = usuariosPorId.get(Number(movimiento.idUsuario)) ?? movimiento.idUsuario ?? "-";
                  tbody.insertAdjacentHTML("beforeend", `
                      <tr>
                          <td>${new Date(movimiento.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                          <td>${esIngreso ? "Ingreso" : "Egreso"}</td>
                          <td>${formatearPrecio(movimiento.monto)}</td>
                          <td>${responsable}</td>
                      </tr>
                  `);
              });
        }
    };

    const actualizarHistorial = (estado) => {
        tablaHistorial.render(estado.historial ?? []);
        const totalRecaudado = document.getElementById("historial-total-recaudado");
        const totalTickets = document.getElementById("historial-total-tickets");

        if (totalRecaudado) {
            totalRecaudado.textContent = formatearPrecio(
                (estado.historial ?? []).reduce((total, transaccion) => total + Number(transaccion.monto), 0)
            );
        }
        if (totalTickets) totalTickets.textContent = String((estado.historial ?? []).length);
    };

    const cargarVentasCaja = async (idCaja) => {
        const ventas = await api.listarVentasCaja(idCaja);
        store.establecerVentas(ventas);
    };

    const cargarMovimientosCaja = async (idCaja) => {
        const transacciones = await api.listarTransaccionesCaja(idCaja);
        store.establecerMovimientos(transacciones);
    };

    const cargarHistorial = async (idUsuario) => {
        const transacciones = await transaccionesApi.listarPorUsuario(idUsuario);
        store.establecerHistorial(transacciones);
    };

    const abrirCajaEnStore = async (caja) => {
        store.abrirCaja(caja);
        await Promise.all([
            cargarVentasCaja(caja.id),
            cargarMovimientosCaja(caja.id),
            cargarHistorial(store.obtenerUsuario().id),
        ]);
    };

    const cerrarCajaEnStore = async () => {
        store.cerrarCaja();
        store.establecerVentas([]);
        store.establecerMovimientos([]);
        store.establecerHistorial([]);
    };

    const cobrarVenta = async () => {
        const caja = store.obtenerCaja();
        if (!caja || !store.puedeCobrar()) return;

        try {
            await api.registrarVenta(caja.id, {
                monto: Number(store.total().toFixed(2)),
                metodoDePago: store.obtenerMetodoPago(),
                articulos: store.obtenerCarrito().map((item) => ({
                    id: item.id,
                    cantidad: item.cantidad,
                    unidad: item.peso ? item.cantidad : undefined,
                    peso: item.peso ? item.cantidad : undefined,
                })),
            });

            await Promise.all([
                cargarVentasCaja(caja.id),
                cargarMovimientosCaja(caja.id),
                cargarHistorial(store.obtenerUsuario().id),
            ]);

            store.limpiarVenta();
            notificar("Venta registrada correctamente.");
        } catch (error) {
            notificar(error.message, "error");
        }
    };

    const buscarProductoPorCodigo = (codigo) => {
        const id = Number(codigo.trim());
        if (!Number.isInteger(id) || id < 1) {
            notificar("Ingresa un codigo de producto valido.", "error");
            return;
        }

        const producto = store.obtenerProductos().find((item) => Number(item.id) === id);
        if (!producto) {
            notificar("Producto no encontrado.", "error");
            return;
        }

        const resultado = store.agregarProducto(producto, 1);
        if (!resultado.ok) {
            notificar(resultado.error, "error");
            return;
        }

        notificar(`${producto.nombre} agregado a la venta.`);
    };

    const cargarCatalogo = async (idCategoria = "") => {
        const productos = idCategoria
            ? await api.filtrarProductos({ idCategoria: Number(idCategoria) })
            : await api.listarProductos();

        const categorias = store.obtenerCategorias();
        const categoriasPorId = new Map(categorias.map((categoria) => [Number(categoria.id), categoria.nombre]));
        const productosTransformados = productos
            .map((producto) => transformarProducto(producto, categoriasPorId))
            .filter(Boolean);

        store.establecerProductos(productosTransformados);
        renderizarFavoritos(productosTransformados.slice(0, 4));
        renderizarGrillaPrincipal(productosTransformados);
    };

    const renderizarChipsCategoria = (categorias) => {
        const nav = document.querySelector("#catalogo .chips-categorias");
        if (!nav) return;

        nav.innerHTML = `
            <button type="button" class="chip active" data-categoria="">Todos</button>
            ${categorias.map((categoria) => `
                <button type="button" class="chip" data-categoria="${categoria.id}">${categoria.nombre}</button>
            `).join("")}
        `;
    };

    store.suscribir((estado) => {
        renderizarCarrito(estado);
        actualizarResumen(estado);
        actualizarEstadoCaja(estado);
        actualizarPerfil(estado);
        actualizarUltimasVentas(estado);
        actualizarArqueo(estado);
        actualizarHistorial(estado);
    });

    iniciarNavegacionVistas({
        selectorVistas: ".vista-tab",
        claseActivaVista: "activa",
    });

    iniciarRelojCaja();
    configurarAtajosTeclado();

    crearModalPausa({ store });

    iniciarModalDescuento({ store, notificar });
    iniciarModalConsulta({ api, notificar });
    iniciarModalCantidad({ store, notificar });

    let modalApertura;
    const cargarDatos = async () => {
        const usuario = await authApi.me();
        store.establecerUsuario(usuario);

        const usuarios = await usuariosApi.listar();
        usuariosPorId = new Map((usuarios.usuarios ?? []).map((item) => [
            Number(item.id),
            `${item.nombre ?? ""} ${item.apellido ?? ""}`.trim() || String(item.id),
        ]));

        const categorias = await api.listarCategorias();
        store.establecerCategorias(categorias);
        renderizarChipsCategoria(categorias);

        const cajasConfiguradas = await configuracionApi.listarCajas();
        modalApertura?.actualizarOpcionesCajas?.(cajasConfiguradas.cajas ?? []);

        await cargarCatalogo();

        const cajasAbiertas = await api.listarCajasAbiertas();
        store.establecerCajasAbiertas(cajasAbiertas);

        const cajaUsuario = cajasAbiertas.find((caja) =>
            String(caja.usuarioAbre) === String(usuario.id) && caja.estado === "abierta"
        );

        if (cajaUsuario) {
            await abrirCajaEnStore(cajaUsuario);
        } else {
            setTimeout(() => modalApertura?.abrirModal(), 150);
        }

        modalApertura?.actualizarOpciones?.();
    };

    modalApertura = iniciarModalApertura({
        store,
        api,
        notificar,
        cajas: [],
        alAbrir: abrirCajaEnStore,
    });

    iniciarModalCierre({
        store,
        api,
        notificar,
        alCerrar: cerrarCajaEnStore,
    });

    iniciarModalMovimiento({
        store,
        api,
        notificar,
        alRegistrar: async () => {
            const caja = store.obtenerCaja();
            if (!caja) return;
            await Promise.all([
                cargarVentasCaja(caja.id),
                cargarMovimientosCaja(caja.id),
            ]);
        },
    });

    crearFiltrosHistorial({
        store,
        onFiltrar: (filtros) => {
            const historial = store.obtenerHistorial();
            tablaHistorial.render(
                historial.filter((transaccion) => {
                    const fecha = new Date(transaccion.fecha);
                    if (filtros.desde && fecha < filtros.desde) return false;
                    if (filtros.hasta && fecha > filtros.hasta) return false;
                    return true;
                })
            );
        },
        onBuscarTicket: async (termino) => {
            const usuario = store.obtenerUsuario();
            if (!usuario) return;

            const tickets = await transaccionesApi.buscarPorTicket(termino.replace(/^#/, ""), usuario.id);
            store.establecerHistorial(tickets);
        },
    });

    document.addEventListener("click", (event) => {
        const btnAgregar = event.target.closest('[data-accion="agregar-al-carrito"]');
        if (btnAgregar) {
            const card = btnAgregar.closest("[data-id]");
            if (!card) return;

            const producto = store.obtenerProductos().find((item) => Number(item.id) === Number(card.dataset.id));
            if (!producto) return;

            const resultado = store.agregarProducto(producto, 1);
            if (!resultado.ok) {
                notificar(resultado.error, "error");
                return;
            }

            notificar(`${producto.nombre} agregado a la venta.`);
            return;
        }

        const btnQuitar = event.target.closest('[data-accion="quitar-producto"]');
        if (btnQuitar) {
            store.quitarProducto(Number(btnQuitar.dataset.id));
            return;
        }

        const btnMetodo = event.target.closest(".metodo-pago");
        if (btnMetodo) {
            document.querySelectorAll(".metodo-pago").forEach((boton) => boton.classList.remove("activo"));
            btnMetodo.classList.add("activo");
            store.setMetodoPago(btnMetodo.dataset.metodo);
            return;
        }

        const btnChipCategoria = event.target.closest("#catalogo .chips-categorias .chip");
        if (btnChipCategoria) {
            document.querySelectorAll("#catalogo .chips-categorias .chip").forEach((chip) => chip.classList.remove("active"));
            btnChipCategoria.classList.add("active");
            cargarCatalogo(btnChipCategoria.dataset.categoria);
            return;
        }

        const btnChipVenta = event.target.closest("#filtros-metodo-pago .chip");
        if (btnChipVenta) {
            document.querySelectorAll("#filtros-metodo-pago .chip").forEach((chip) => chip.classList.remove("active"));
            btnChipVenta.classList.add("active");
            tablaVentas.render(store.filtrarVentas(store.obtenerVentas(), btnChipVenta.dataset.filtro));
            return;
        }

        if (event.target.closest("#boton-cobrar")) {
            cobrarVenta();
        }

        if (event.target.closest("#btn-logout")) {
            authApi.logout().finally(() => {
                window.location.href = "/login.html";
            });
        }
    });

    document.querySelectorAll(".lector-form").forEach((formulario) => {
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = formulario.querySelector("input");
            if (!input) return;
            buscarProductoPorCodigo(input.value);
            input.value = "";
            input.focus();
        });
    });

    // El modal de apertura se inicializa con las cajas obtenidas luego de cargar datos.
    // Se actualiza cuando estan disponibles.
    const actualizarModalApertura = async () => {
        try {
            const resultado = await configuracionApi.listarCajas();
            const cajas = resultado.cajas ?? [];
            if (modalApertura?.actualizarOpcionesCajas) {
                modalApertura.actualizarOpcionesCajas(cajas);
            }
        } catch (error) {
            notificar(error.message, "error");
        }
    };

    cargarDatos().then(() => {
        actualizarModalApertura();
    }).catch((error) => {
        notificar(error.message, "error");
    });
}

document.addEventListener("DOMContentLoaded", iniciarCaja);
