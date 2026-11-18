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
import { iniciarPerfil } from "../Perfil/perfil.page.js";
import { iniciarControlInactividad } from "../../common/utils/sesionInactividad.js";
import { iniciarModalMovimiento } from "../Transacciones/modales/movimiento.js";
import { crearTablaVentas } from "../Transacciones/components/tablaVentas.js";
import { crearTablaHistorial } from "../Transacciones/components/tablaHistorial.js";
import { crearFiltrosHistorial } from "../Transacciones/components/filtrosHistorial.js";
import {
  abrirModalOverlay,
  cerrarModalOverlay,
} from "../../common/components/modalOverlay.js";
import {
  generarCodigoBarrasFalso,
  iniciarGeneradorCodigoBarras,
} from "./components/codigoDeBarras.js";
import { crearPaginador } from "../../common/components/paginacion.js";

const transformarProducto = (producto, categoriasPorId) => {
  const precio = Number(producto.precioUsd) * Number(producto.cotizacion);

  if (!Number.isFinite(precio) || precio <= 0) return null;

  return {
    ...producto,
    precio,
    stock: producto.unidad ?? producto.peso ?? null,
    peso: producto.peso !== undefined,
    unidadMedida: producto.peso !== undefined ? "kg" : "u",
    codigoBarras: generarCodigoBarrasFalso(producto.id),
    categoria:
      categoriasPorId.get(Number(producto.idCategoria)) ?? "Sin categoria",
  };
};

export function iniciarCaja() {
  void iniciarControlInactividad();
  renderizarIconos();
  iniciarPerfil();

  const store = crearCajaStore();
  const api = crearCajaApi();
  const authApi = crearAuthApi();
  const transaccionesApi = crearTransaccionesApi();
  const configuracionApi = crearConfiguracionApi();
  const usuariosApi = crearUsuariosApi();
  let usuariosPorId = new Map();
  let cajasConfiguradas = [];
  let cajaSeleccionada = null;
  const notificar = mostrarNotificacion;

  const tablaVentas = crearTablaVentas({
    tbody: document.getElementById("lista-ventas-turno"),
  });

  const tablaUltimasVentas = crearTablaVentas({
    tbody: document.getElementById("tabla-base-body"),
  });

  const tablaHistorial = crearTablaHistorial({
    tbody: document.getElementById("lista-historial-completo"),
  });

  const itemsPorPaginaVista = 10;
  let ventasFiltradas = [];
  let paginaVentas = 1;
  let filtroVentas = "Todos";
  let movimientosPagina = [];
  let paginaArqueo = 1;
  let historialFiltrado = [];
  let paginaHistorial = 1;
  let ventasUltimasOrdenadas = [];
  const ordenTablas = {};

  const paginadorVentas = crearPaginador({
    contenedor: document.getElementById("numeros-paginacion-ventas"),
    btnAnterior: document.getElementById("btn-anterior-ventas"),
    btnSiguiente: document.getElementById("btn-siguiente-ventas"),
    onSeleccionar(pagina) {
      paginaVentas = pagina;
      renderizarVentas();
    },
  });

  const paginadorArqueo = crearPaginador({
    contenedor: document.getElementById("numeros-paginacion-arqueo"),
    btnAnterior: document.getElementById("btn-anterior-arqueo"),
    btnSiguiente: document.getElementById("btn-siguiente-arqueo"),
    onSeleccionar(pagina) {
      paginaArqueo = pagina;
      renderizarMovimientos();
    },
  });

  const paginadorHistorial = crearPaginador({
    contenedor: document.getElementById("numeros-paginacion-historial"),
    btnAnterior: document.getElementById("btn-anterior-historial"),
    btnSiguiente: document.getElementById("btn-siguiente-historial"),
    onSeleccionar(pagina) {
      paginaHistorial = pagina;
      renderizarHistorial();
    },
  });

  function renderizarVentas() {
    const totalPaginas =
      Math.ceil(ventasFiltradas.length / itemsPorPaginaVista) || 1;
    paginaVentas = Math.min(Math.max(paginaVentas, 1), totalPaginas);
    const inicio = (paginaVentas - 1) * itemsPorPaginaVista;
    tablaVentas.render(
      ventasFiltradas.slice(inicio, inicio + itemsPorPaginaVista),
    );
    paginadorVentas.render({
      pagina: paginaVentas,
      totalPaginas,
    });
  }

  function renderizarMovimientos() {
    const tbody = document.getElementById("lista-movimientos-turno");
    if (!tbody) return;

    const totalPaginas =
      Math.ceil(movimientosPagina.length / itemsPorPaginaVista) || 1;
    paginaArqueo = Math.min(Math.max(paginaArqueo, 1), totalPaginas);
    const inicio = (paginaArqueo - 1) * itemsPorPaginaVista;

    tbody.innerHTML = "";
    if (!movimientosPagina.length) {
      tbody.innerHTML = `<tr><td colspan="4">No hay datos</td></tr>`;
    } else {
      movimientosPagina
        .slice(inicio, inicio + itemsPorPaginaVista)
        .forEach((movimiento) => {
          const esIngreso = Number(movimiento.monto) > 0;
          const responsable =
            usuariosPorId.get(Number(movimiento.idUsuario)) ??
            movimiento.idUsuario ??
            "-";
          tbody.insertAdjacentHTML(
            "beforeend",
            `<tr>
              <td>${new Date(movimiento.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
              <td>${esIngreso ? "Ingreso" : "Egreso"}</td>
              <td>${formatearPrecio(movimiento.monto)}</td>
              <td>${responsable}</td>
            </tr>`,
          );
        });
    }

    paginadorArqueo.render({
      pagina: paginaArqueo,
      totalPaginas,
    });
  }

  function renderizarHistorial() {
    const totalPaginas =
      Math.ceil(historialFiltrado.length / itemsPorPaginaVista) || 1;
    paginaHistorial = Math.min(Math.max(paginaHistorial, 1), totalPaginas);
    const inicio = (paginaHistorial - 1) * itemsPorPaginaVista;
    tablaHistorial.render(
      historialFiltrado.slice(inicio, inicio + itemsPorPaginaVista),
    );
    paginadorHistorial.render({
      pagina: paginaHistorial,
      totalPaginas,
    });
  }

  const obtenerValorOrden = (item, columna, tabla) => {
    if (tabla === "movimientos") {
      if (columna === "tipo") return Number(item.monto) > 0 ? "Ingreso" : "Egreso";
      if (columna === "responsable") {
        return usuariosPorId.get(Number(item.idUsuario)) ?? String(item.idUsuario ?? "");
      }
    }

    if (tabla === "historial" && columna === "estado") {
      return Number(item.monto) > 0 ? "Cobrado" : "Egreso";
    }

    if (columna === "fecha") return new Date(item.fecha).getTime() || 0;
    return item[columna] ?? "";
  };

  const ordenarLista = (lista, tabla, columna) => {
    const clave = `${tabla}-${columna}`;
    const ascendente =
      ordenTablas[clave] === undefined || ordenTablas[clave] === "desc";
    ordenTablas[clave] = ascendente ? "asc" : "desc";

    document
      .querySelectorAll(`th[data-table="${tabla}"]`)
      .forEach((cabecera) => {
        cabecera.setAttribute("aria-sort", "none");
      });

    const cabeceraActiva = document.querySelector(
      `th[data-table="${tabla}"][data-sort="${columna}"]`,
    );
    cabeceraActiva?.setAttribute(
      "aria-sort",
      ascendente ? "ascending" : "descending",
    );

    const icono = cabeceraActiva?.querySelector(".icono-sort");
    if (icono) {
      icono.setAttribute(
        "data-lucide",
        ascendente ? "chevron-up" : "chevron-down",
      );
      renderizarIconos(cabeceraActiva);
    }

    lista.sort((a, b) => {
      let valorA = obtenerValorOrden(a, columna, tabla);
      let valorB = obtenerValorOrden(b, columna, tabla);

      if (typeof valorA === "string") valorA = valorA.toLowerCase();
      if (typeof valorB === "string") valorB = valorB.toLowerCase();

      if (typeof valorA === "number" && typeof valorB === "number") {
        return ascendente ? valorA - valorB : valorB - valorA;
      }

      return ascendente
        ? String(valorA).localeCompare(String(valorB), "es")
        : String(valorB).localeCompare(String(valorA), "es");
    });
  };

  const modalCobro = document.getElementById("modal-cobro");
  const inputMontoRecibido = document.getElementById("monto-recibido");
  const visorVuelto = document.getElementById("monto-vuelto");
  const seccionEfectivo = document.getElementById("seccion-efectivo");
  const textoTotalCobro = document.getElementById("modal-total-cobro");

  let metodoPagoCobro = "efectivo";
  let totalAcobrar = 0;

  inputMontoRecibido?.addEventListener("input", (event) => {
    const montoRecibido = Number(event.target.value) || 0;
    const vuelto = montoRecibido - totalAcobrar;

    visorVuelto.textContent =
      vuelto >= 0 ? formatearPrecio(vuelto) : formatearPrecio(0);
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
    contenedor.innerHTML = estado.carrito
      .map(
        (item) => `
            <article class="carrito-item" data-id="${item.id}">
                <div class="carrito-item-info">
                    <strong>${item.nombre}</strong>
                    <span>${item.cantidad} ${item.unidadMedida} x ${formatearPrecio(item.precio)}</span>
                </div>
                <strong>${formatearPrecio(item.precio * item.cantidad)}</strong>
                <button type="button" class="btn-quitar-carrito" data-accion="quitar-producto" data-id="${item.id}" aria-label="Quitar ${item.nombre}">
                    <i data-lucide="trash-2" aria-hidden="true"></i>
                </button>
            </article>
        `,
      )
      .join("");
    renderizarIconos(contenedor);
  };

  const actualizarResumen = (estado) => {
    const subtotal = estado.carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0,
    );
    const ajuste = store.montoAjuste();
    const total = store.total();

    const elementoSubtotal = document.getElementById("subtotal-venta");
    const elementoDescuento = document.getElementById("descuento-venta");
    const elementoTotal = document.getElementById("total-venta");
    const elementoContador = document.getElementById("cantidad-productos");
    const elementoEtiqueta = document.getElementById("etiqueta-ajuste");
    const botonCobrar = document.getElementById("boton-cobrar");

    if (elementoSubtotal)
      elementoSubtotal.textContent = formatearPrecio(subtotal);
    if (elementoDescuento)
      elementoDescuento.textContent = formatearPrecio(ajuste);
    if (elementoTotal) elementoTotal.textContent = formatearPrecio(total);
    if (elementoContador)
      elementoContador.textContent = String(store.cantidadItems());
    if (elementoEtiqueta) {
      elementoEtiqueta.textContent =
        estado.modificador.tipo === "recargo" ? "Recargo" : "Descuento";
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

    document
      .querySelectorAll('[data-campo="nombre-cajero"]')
      .forEach((elemento) => {
        elemento.textContent = nombreCompleto || "Cajero";
      });

    const nombreCierre = document.querySelector(
      '[data-campo="nombre-cajero-cierre"]',
    );
    if (nombreCierre) nombreCierre.textContent = nombreCompleto || "el cajero";

    const horaApertura = estado.horarioInicioTurno
      ? `${estado.horarioInicioTurno} hs`
      : caja?.fechaApertura
        ? new Date(caja.fechaApertura).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "--:--";

    document
      .querySelectorAll('[data-campo="hora-apertura"]')
      .forEach((elemento) => {
        elemento.textContent = horaApertura;
      });
    const horarioEmpleado = document.getElementById("horario-empleado");

    if (horarioEmpleado) {
      horarioEmpleado.textContent =
        estado.horarioEmpleado || "07:00 - 12:00 hs";
    }

    renderizarSelectorCaja();
    actualizarBotonCaja();
  };

  const actualizarPerfil = (estado) => {
    const usuario = estado.usuario;
    const caja = estado.caja;
    const nombreCompleto =
      `${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`.trim() || "Cajero";

    document
      .querySelectorAll('[data-campo="perfil-nombre"]')
      .forEach((elemento) => {
        elemento.textContent = nombreCompleto;
      });

    const email = document.getElementById("perfil-email");
    if (email) email.textContent = usuario?.email ?? "";

    const rol = document.getElementById("perfil-rol");
    if (rol) rol.textContent = usuario?.rol ?? "--";

    const nombreCompletoEl = document.getElementById("perfil-nombre-completo");
    if (nombreCompletoEl) nombreCompletoEl.textContent = nombreCompleto;

    const cajaActual = document.getElementById("perfil-caja");
    if (cajaActual)
      cajaActual.textContent = caja ? `Caja ${caja.nroCaja}` : "Sin caja";
  };

  const actualizarUltimasVentas = (estado) => {
    const ventas = estado.ventas ?? [];
    ventasFiltradas = store.filtrarVentas(ventas, filtroVentas);
    paginaVentas = 1;
    renderizarVentas();

    ventasUltimasOrdenadas = [...ventas].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
    tablaUltimasVentas.render(ventasUltimasOrdenadas.slice(0, 5));

    const totalTickets = document.getElementById("total-tickets");
    if (totalTickets) {
      totalTickets.textContent = String(ventas.length);
    }
  };

  const actualizarFavoritosRanking = () => {
    const productos = store.obtenerProductos();
    const favoritos = store
      .obtenerFavoritosIds()
      .map((id) =>
        productos.find((producto) => Number(producto.id) === Number(id)),
      )
      .filter(Boolean)
      .slice(0, 6);

    renderizarFavoritos(favoritos);
  };

  const actualizarArqueo = (estado) => {
    const caja = estado.caja;
    const fondo = document.getElementById("arqueo-fondo-inicial");
    const ingresos = document.getElementById("arqueo-ingresos");
    const egresos = document.getElementById("arqueo-egresos");

    if (fondo) fondo.textContent = formatearPrecio(caja?.montoInicial ?? 0);

    const movimientos = estado.movimientos ?? [];
    const totalIngresos = movimientos
      .filter((movimiento) => Number(movimiento.monto) > 0)
      .reduce((total, movimiento) => total + Number(movimiento.monto), 0);
    const totalEgresos = movimientos
      .filter((movimiento) => Number(movimiento.monto) < 0)
      .reduce(
        (total, movimiento) => total + Math.abs(Number(movimiento.monto)),
        0,
      );

    if (ingresos) ingresos.textContent = `+ ${formatearPrecio(totalIngresos)}`;
    if (egresos) egresos.textContent = `- ${formatearPrecio(totalEgresos)}`;

    movimientosPagina = movimientos;
    paginaArqueo = 1;
    renderizarMovimientos();
  };

  const actualizarHistorial = (estado) => {
    historialFiltrado = [...(estado.historial ?? [])];
    paginaHistorial = 1;
    renderizarHistorial();
    const totalRecaudado = document.getElementById("historial-total-recaudado");
    const totalTickets = document.getElementById("historial-total-tickets");

    if (totalRecaudado) {
      totalRecaudado.textContent = formatearPrecio(
        (estado.historial ?? []).reduce(
          (total, transaccion) => total + Number(transaccion.monto),
          0,
        ),
      );
    }
    if (totalTickets)
      totalTickets.textContent = String((estado.historial ?? []).length);
  };

  const cargarVentasCaja = async (idCaja) => {
    const ventas = await api.listarVentasCaja(idCaja);
    store.establecerVentas(ventas);
  };

  const cargarMovimientosCaja = async (idCaja) => {
    const transacciones = await api.listarTransaccionesCaja(idCaja);
    store.establecerMovimientos(transacciones);
  };

  const cargarHistorial = async (nroCaja) => {
    if (!nroCaja) {
      store.establecerHistorial([]);
      return;
    }

    const [cajas, transacciones] = await Promise.all([
      api.listarCajas(),
      transaccionesApi.listarTodas(),
    ]);

    const idsCaja = (cajas ?? [])
      .filter((caja) => String(caja.nroCaja).trim() === String(nroCaja).trim())
      .map((caja) => Number(caja.id));

    const historial = (transacciones ?? []).filter((transaccion) =>
      idsCaja.includes(Number(transaccion.idCaja)),
    );

    store.establecerHistorial(historial);
  };

  const abrirCajaEnStore = async (caja, horario = null) => {
    cajaSeleccionada = String(caja.nroCaja).trim();
    store.abrirCaja(caja, horario);
    const cajasAbiertas = await api.listarCajasAbiertas();
    store.establecerCajasAbiertas(cajasAbiertas);
    await Promise.all([
      cargarVentasCaja(caja.id),
      cargarMovimientosCaja(caja.id),
      cargarHistorial(caja.nroCaja),
    ]);
  };

  const cerrarCajaEnStore = async (cajaParam = null) => {
    const nroCaja =
      cajaParam?.nroCaja ?? store.obtenerCaja()?.nroCaja ?? cajaSeleccionada;
    store.cerrarCaja();
    store.establecerVentas([]);
    store.establecerMovimientos([]);
    const cajasAbiertas = await api.listarCajasAbiertas();
    store.establecerCajasAbiertas(cajasAbiertas);
    await cargarHistorial(nroCaja);
  };

  const cobrarVenta = async () => {
    const caja = store.obtenerCaja();
    if (!caja || !store.puedeCobrar()) return false;

    try {
      const productosVendidos = store.obtenerCarrito();
      await api.registrarVenta(caja.id, {
        monto: Number(store.total().toFixed(2)),
        metodoDePago: store.obtenerMetodoPago(),
        articulos: productosVendidos.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          unidad: item.peso ? item.cantidad : undefined,
          peso: item.peso ? item.cantidad : undefined,
        })),
      });

      store.registrarVentaFavoritos(productosVendidos);

      await Promise.all([
        cargarVentasCaja(caja.id),
        cargarMovimientosCaja(caja.id),
        cargarHistorial(caja.nroCaja),
      ]);

      store.limpiarVenta();
      notificar("Venta registrada correctamente.");
      return true;
    } catch (error) {
      notificar(error.message, "error");
      return false;
    }
  };

  const buscarProductoPorCodigo = (codigo) => {
    const id = Number(codigo.trim());
    if (!Number.isInteger(id) || id < 1) {
      notificar("Ingresa un codigo de producto valido.", "error");
      return;
    }

    const producto = store
      .obtenerProductos()
      .find((item) => Number(item.id) === id);
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
  const inputInicio = document.querySelector(
    "#inicio .lector-form .lector-input",
  );
  const listaResultados = document.getElementById("lista-resultados-inicio");

  inputInicio?.addEventListener("input", () => {
    const termino = inputInicio.value.toLowerCase().trim();

    if (!termino) {
      listaResultados.innerHTML = "";
      listaResultados.classList.remove("visible");
      return;
    }

    const coincidencias = store.obtenerProductos().filter((producto) => {
      const nombre = String(producto.nombre ?? "").toLowerCase();
      const id = String(producto.id ?? "");
      return nombre.includes(termino) || id.includes(termino);
    });

    listaResultados.innerHTML = coincidencias
      .slice(0, 8)
      .map(
        (producto) => `
      <button type="button" class="resultado-busqueda" data-id="${producto.id}">
        <strong>${producto.nombre}</strong>
        <span>${formatearPrecio(producto.precio)}</span>
      </button>
    `,
      )
      .join("");

    listaResultados.classList.toggle("visible", coincidencias.length > 0);
  });

  listaResultados?.addEventListener("click", (event) => {
    const resultado = event.target.closest(".resultado-busqueda");
    if (!resultado) return;

    const producto = store
      .obtenerProductos()
      .find((item) => Number(item.id) === Number(resultado.dataset.id));
    if (!producto) return;

    const respuesta = store.agregarProducto(producto, 1);
    if (!respuesta.ok) {
      notificar(respuesta.error, "error");
      return;
    }

    inputInicio.value = "";
    listaResultados.innerHTML = "";
    listaResultados.classList.remove("visible");
    notificar(`${producto.nombre} agregado a la venta.`);
  });

  const cargarCatalogo = async (idCategoria = "") => {
    const productos = idCategoria
      ? await api.filtrarProductos({ idCategoria: Number(idCategoria) })
      : await api.listarProductos();

    const categorias = store.obtenerCategorias();
    const categoriasPorId = new Map(
      categorias.map((categoria) => [Number(categoria.id), categoria.nombre]),
    );
    const productosTransformados = productos
      .map((producto) => transformarProducto(producto, categoriasPorId))
      .filter(Boolean);

    store.establecerProductos(productosTransformados);
    catalogoBase = productosTransformados;
    catalogoFiltrado = [...catalogoBase];
    paginaCatalogo = 1;
    inputBuscarProducto.value = "";
    renderizarCatalogo();
  };

  const itemsPorPaginaCatalogo = 10;
  let catalogoBase = [];
  let catalogoFiltrado = [];
  let paginaCatalogo = 1;

  const paginadorCatalogo = crearPaginador({
    contenedor: document.getElementById("numeros-paginacion-catalogo"),
    btnAnterior: document.getElementById("btn-anterior-catalogo"),
    btnSiguiente: document.getElementById("btn-siguiente-catalogo"),
    onSeleccionar(pagina) {
      paginaCatalogo = pagina;
      renderizarCatalogo();
    },
  });

  function renderizarCatalogo() {
    const totalPaginas =
      Math.ceil(catalogoFiltrado.length / itemsPorPaginaCatalogo) || 1;

    if (paginaCatalogo > totalPaginas) paginaCatalogo = totalPaginas;
    if (paginaCatalogo < 1) paginaCatalogo = 1;

    const inicio = (paginaCatalogo - 1) * itemsPorPaginaCatalogo;
    const productosPagina = catalogoFiltrado.slice(
      inicio,
      inicio + itemsPorPaginaCatalogo,
    );

    actualizarFavoritosRanking();
    renderizarGrillaPrincipal(productosPagina);
    paginadorCatalogo.render({
      pagina: paginaCatalogo,
      totalPaginas,
    });
  }

  const inputBuscarProducto = document.getElementById("buscar-producto-caja");

  inputBuscarProducto?.addEventListener("input", () => {
    const termino = inputBuscarProducto.value.toLowerCase().trim();

    catalogoFiltrado = catalogoBase.filter((producto) => {
      const nombre = String(producto.nombre ?? "").toLowerCase();
      const id = String(producto.id ?? "");

      return nombre.includes(termino) || id.includes(termino);
    });

    paginaCatalogo = 1;
    renderizarCatalogo();
  });

  const renderizarChipsCategoria = (categorias) => {
    const nav = document.querySelector("#catalogo .chips-categorias");
    if (!nav) return;

    nav.innerHTML = `
            <button type="button" class="chip active" data-categoria="">Todos</button>
            ${categorias
              .map(
                (categoria) => `
                <button type="button" class="chip" data-categoria="${categoria.id}">${categoria.nombre}</button>
            `,
              )
              .join("")}
        `;
  };

  const renderizarSelectorCaja = () => {
    const abiertas = store.obtenerCajasAbiertas();
    document
      .querySelectorAll('select[data-campo="estado-caja"]')
      .forEach((select) => {
        const valorPrevio = cajaSeleccionada || select.value;
        select.innerHTML = "";
        const opcionPorDefecto = document.createElement("option");
        opcionPorDefecto.value = "";
        opcionPorDefecto.textContent = "Seleccione una caja";
        opcionPorDefecto.disabled = true;
        select.appendChild(opcionPorDefecto);
        cajasConfiguradas.forEach((cajaConfig) => {
          const nombre = String(cajaConfig?.nombre ?? cajaConfig).trim();
          const abierta = abiertas.find(
            (item) =>
              String(item.nroCaja).trim() === nombre &&
              item.estado === "abierta",
          );
          const opcion = document.createElement("option");
          opcion.value = nombre;
          opcion.textContent = abierta
            ? `${nombre} (abierta)`
            : `${nombre} (cerrada)`;
          select.appendChild(opcion);
        });
        if (
          valorPrevio &&
          [...select.options].some((opcion) => opcion.value === valorPrevio)
        ) {
          select.value = valorPrevio;
          cajaSeleccionada = valorPrevio;
        } else if (cajasConfiguradas.length) {
          select.value = "";
          cajaSeleccionada = null;
        } else {
          select.value = "";
        }
      });
  };

  const actualizarBotonCaja = () => {
    const boton = document.getElementById("boton-cerrar-caja");
    if (!boton) return;
    const abierta = Boolean(store.obtenerCaja());
    boton.dataset.accion = abierta
      ? "abrir-modal-cierre"
      : "abrir-modal-apertura";
    const span = boton.querySelector("span");
    if (span) span.textContent = abierta ? "Cerrar caja" : "Abrir caja";
    const icono = boton.querySelector("i, svg");
    if (icono) {
      const nuevoIcono = document.createElement("i");
      nuevoIcono.setAttribute(
        "data-lucide",
        abierta ? "lock-keyhole" : "lock-open",
      );
      icono.replaceWith(nuevoIcono);
    }
    renderizarIconos(boton);
  };

  store.suscribir((estado) => {
    renderizarCarrito(estado);
    actualizarResumen(estado);
    actualizarEstadoCaja(estado);
    actualizarPerfil(estado);
    actualizarUltimasVentas(estado);
    actualizarArqueo(estado);
    actualizarHistorial(estado);
    actualizarFavoritosRanking();
  });

  iniciarNavegacionVistas({
    selectorVistas: ".vista-tab",
    claseActivaVista: "activa",
  });

  iniciarRelojCaja();
  configurarAtajosTeclado({ store, notificar });

  document.addEventListener("change", async (event) => {
    const select = event.target.closest('select[data-campo="estado-caja"]');
    if (!select) return;

    if (!select.value) return;

    cajaSeleccionada = select.value;
    const abierta = store
      .obtenerCajasAbiertas()
      .find(
        (caja) =>
          String(caja.nroCaja).trim() === String(cajaSeleccionada).trim() &&
          caja.estado === "abierta",
      );

    if (abierta) {
      abrirCajaEnStore(abierta).then(() => {
        renderizarSelectorCaja();
        actualizarBotonCaja();
      });
    } else {
      store.cerrarCaja();
      store.establecerVentas([]);
      store.establecerMovimientos([]);
      const cajasAbiertas = await api.listarCajasAbiertas();
      store.establecerCajasAbiertas(cajasAbiertas);
      await cargarHistorial(cajaSeleccionada);
      renderizarSelectorCaja();
      actualizarBotonCaja();
    }
  });

  crearModalPausa({ store, notificar });

  iniciarModalDescuento({ store, notificar });
  iniciarModalConsulta({ api, store, configuracionApi, notificar });
  iniciarModalCantidad({ store, notificar });
  iniciarGeneradorCodigoBarras({ store });

  let modalApertura;
  const cargarDatos = async () => {
    const usuario = await authApi.me();
    store.establecerUsuario(usuario);

    const usuarios = await usuariosApi.listar();
    usuariosPorId = new Map(
      (usuarios.usuarios ?? []).map((item) => [
        Number(item.id),
        `${item.nombre ?? ""} ${item.apellido ?? ""}`.trim() || String(item.id),
      ]),
    );

    const categorias = await api.listarCategorias();
    store.establecerCategorias(categorias);
    renderizarChipsCategoria(categorias);

    const resultadoCajas = await configuracionApi.listarCajas();
    cajasConfiguradas = resultadoCajas.cajas ?? [];
    modalApertura?.actualizarOpcionesCajas?.(cajasConfiguradas);

    await cargarCatalogo();

    const cajasAbiertas = await api.listarCajasAbiertas();
    store.establecerCajasAbiertas(cajasAbiertas);

    cajaSeleccionada = null;

    renderizarSelectorCaja();
    actualizarBotonCaja();
    modalApertura?.actualizarOpciones?.();
  };

  modalApertura = iniciarModalApertura({
    store,
    api,
    notificar,
    cajas: [],
    alAbrir: async (caja, horario) => {
      await abrirCajaEnStore(caja, horario);
      cajaSeleccionada = String(caja.nroCaja).trim();
      renderizarSelectorCaja();
      actualizarBotonCaja();
    },
    obtenerCajaSeleccionada: () => cajaSeleccionada,
  });

  iniciarModalCierre({
    store,
    api,
    notificar,
    alCerrar: async (caja) => {
      await cerrarCajaEnStore(caja);
      cajaSeleccionada = String(caja.nroCaja).trim();
      renderizarSelectorCaja();
      actualizarBotonCaja();
    },
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
        }),
      );
    },
    onBuscarTicket: async (termino) => {
      const terminoLimpiado = termino.replace(/^#/, "").trim();
      if (!terminoLimpiado) {
        await cargarHistorial(cajaSeleccionada);
        return;
      }

      if (!/^\d+$/.test(terminoLimpiado)) {
        notificar("Ingresa un numero de ticket valido.", "error");
        return;
      }

      const usuario = store.obtenerUsuario();
      if (!usuario) return;

      try {
        const tickets = await transaccionesApi.buscarPorTicket(
          terminoLimpiado,
          usuario.idUsuario ?? usuario.id,
        );
        store.establecerHistorial(tickets);
      } catch (error) {
        notificar(error.message, "error");
      }
    },
  });

  document.addEventListener("click", (event) => {
    const cabecera = event.target.closest("th.sortable[data-sort][data-table]");
    if (!cabecera) return;

    const tabla = cabecera.dataset.table;
    const columna = cabecera.dataset.sort;

    if (tabla === "ultimas") {
      ordenarLista(ventasUltimasOrdenadas, tabla, columna);
      tablaUltimasVentas.render(ventasUltimasOrdenadas.slice(0, 5));
      return;
    }

    if (tabla === "ventas") {
      ordenarLista(ventasFiltradas, tabla, columna);
      paginaVentas = 1;
      renderizarVentas();
      return;
    }

    if (tabla === "movimientos") {
      ordenarLista(movimientosPagina, tabla, columna);
      paginaArqueo = 1;
      renderizarMovimientos();
      return;
    }

    if (tabla === "historial") {
      ordenarLista(historialFiltrado, tabla, columna);
      paginaHistorial = 1;
      renderizarHistorial();
    }
  });

  document.addEventListener("click", (event) => {
    const btnAbrirNumpad = event.target.closest(
      '[data-accion="abrir-modal-cantidad"]',
    );
    if (!btnAbrirNumpad) {
      const cardProducto = event.target.closest(".card-producto");
      if (cardProducto) {
        const producto = store
          .obtenerProductos()
          .find((item) => Number(item.id) === Number(cardProducto.dataset.id));
        if (producto) {
          const resultado = store.agregarProducto(producto, 1);
          if (!resultado.ok) {
            notificar(resultado.error, "error");
            return;
          }

          notificar(`${producto.nombre} agregado a la venta.`);
          return;
        }
      }
    }

    const btnAgregar = event.target.closest(
      '[data-accion="agregar-al-carrito"]',
    );
    if (btnAgregar) {
      const card = btnAgregar.closest("[data-id]");
      if (!card) return;

      const producto = store
        .obtenerProductos()
        .find((item) => Number(item.id) === Number(card.dataset.id));
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
      document
        .querySelectorAll(".metodo-pago")
        .forEach((boton) => boton.classList.remove("activo"));
      btnMetodo.classList.add("activo");
      store.setMetodoPago(btnMetodo.dataset.metodo);
      return;
    }

    const btnChipCategoria = event.target.closest(
      "#catalogo .chips-categorias .chip",
    );
    if (btnChipCategoria) {
      document
        .querySelectorAll("#catalogo .chips-categorias .chip")
        .forEach((chip) => chip.classList.remove("active"));
      btnChipCategoria.classList.add("active");
      cargarCatalogo(btnChipCategoria.dataset.categoria);
      return;
    }

    const btnChipVenta = event.target.closest("#filtros-metodo-pago .chip");
    if (btnChipVenta) {
      document
        .querySelectorAll("#filtros-metodo-pago .chip")
        .forEach((chip) => chip.classList.remove("active"));
      btnChipVenta.classList.add("active");
      filtroVentas = btnChipVenta.dataset.filtro;
      ventasFiltradas = store.filtrarVentas(
        store.obtenerVentas(),
        filtroVentas,
      );
      paginaVentas = 1;
      renderizarVentas();
      return;
    }

    const btnAbrirCobro = event.target.closest(
      '[data-accion="abrir-modal-cobro"]',
    );
    if (btnAbrirCobro) {
      if (store.obtenerCarrito().length === 0) return;

      metodoPagoCobro = "efectivo";
      store.setMetodoPago(metodoPagoCobro);
      totalAcobrar = store.total();

      if (textoTotalCobro) {
        textoTotalCobro.textContent = formatearPrecio(totalAcobrar);
      }
      if (inputMontoRecibido) inputMontoRecibido.value = "";
      if (visorVuelto) visorVuelto.textContent = formatearPrecio(0);
      if (seccionEfectivo) seccionEfectivo.style.display = "flex";

      document
        .querySelectorAll("#tabs-metodos-pago .tab-btn")
        .forEach((boton, indice) => {
          boton.classList.toggle("activo", indice === 0);
        });

      abrirModalOverlay(modalCobro);
      setTimeout(() => inputMontoRecibido?.focus(), 100);
      return;
    }

    if (event.target.closest('[data-accion="cerrar-modal-cobro"]')) {
      cerrarModalOverlay(modalCobro);
      return;
    }

    const btnMetodoCobro = event.target.closest(
      '[data-accion="seleccionar-metodo"]',
    );
    if (btnMetodoCobro) {
      document
        .querySelectorAll("#tabs-metodos-pago .tab-btn")
        .forEach((boton) => boton.classList.remove("activo"));

      btnMetodoCobro.classList.add("activo");
      metodoPagoCobro = btnMetodoCobro.dataset.metodo;
      store.setMetodoPago(metodoPagoCobro);

      if (metodoPagoCobro === "efectivo") {
        if (seccionEfectivo) seccionEfectivo.style.display = "flex";
        setTimeout(() => inputMontoRecibido?.focus(), 50);
      } else if (seccionEfectivo) {
        seccionEfectivo.style.display = "none";
      }
      return;
    }

    if (event.target.closest("#btn-confirmar-cobro")) {
      if (metodoPagoCobro === "efectivo") {
        const montoRecibido = Number(inputMontoRecibido?.value) || 0;
        if (montoRecibido < totalAcobrar) {
          notificar("El monto recibido es insuficiente.", "error");
          return;
        }
      }

      cobrarVenta().then((confirmado) => {
        if (confirmado) cerrarModalOverlay(modalCobro);
      });
      return;
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

  cargarDatos()
    .then(() => {
      actualizarModalApertura();
    })
    .catch((error) => {
      notificar(error.message, "error");
    });
}

document.addEventListener("DOMContentLoaded", iniciarCaja);
