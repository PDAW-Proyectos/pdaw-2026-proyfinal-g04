import { iniciarNavegacionVistas } from "../../common/components/navegacionVistas.js";
import { mostrarToast } from "../../common/utils/alertas.js";
import { renderizarIconos } from "../../common/utils/iconos.js";
import { crearArticulosApi } from "./articulos.api.js";
import { crearArticulosStore } from "./articulos.store.js";
import { renderizarInicioRepositor } from "./inicio.repositor.pages.js";
import { crearTablaInventario } from "./components/tablaInventario.js";
import { crearTablaProveedores } from "./components/tablaProveedores.js";
import { conectarFiltrosInventario } from "./components/filtrosInventario.js";
import {
  crearPaginacionInventario,
  crearPaginacionProveedores,
} from "./components/paginacion.js";
import { crearModalStock } from "./modales/stock.js";
import { crearModalEscaner } from "./modales/escaner.js";
import { iniciarPerfil } from "../Perfil/perfil.page.js";
import { iniciarHistorial } from "../Historial/historial.page.js";
import { iniciarControlInactividad } from "../../common/utils/sesionInactividad.js";

export async function iniciarArticulos() {
  void iniciarControlInactividad();
  renderizarIconos();
  iniciarPerfil();

  const historial = iniciarHistorial();
  const api = crearArticulosApi();
  const store = crearArticulosStore();

  const inputBuscador = document.getElementById("buscar-producto");
  const selectSemaforo = document.getElementById("select-semaforo");
  const inputBuscadorProv = document.getElementById("buscar-proveedor");

  const tablaInventario = crearTablaInventario({
    tbody: document.getElementById("tabla-base-body"),
    onActualizar(id) {
      const producto = store.buscarProducto(id);

      if (producto) {
        modalStock.abrir(producto);
      } else {
        mostrarToast("No se encontró el producto seleccionado", true);
      }
    },
  });

  const tablaProveedores = crearTablaProveedores({
    tbody: document.getElementById("tabla-proveedores-body"),
  });

  const paginacionInventario = crearPaginacionInventario({
    onSeleccionar(pagina) {
      store.setPagina(pagina);
      renderizarInventario();
    },
  });

  const paginacionProveedores = crearPaginacionProveedores({
    onSeleccionar(pagina) {
      store.setPaginaProveedores(pagina);
      renderizarProveedores();
    },
  });

  const modalStock = crearModalStock({
    onGuardar: async (id, cambios) => {
      const producto = store.buscarProducto(id);

      if (!producto) {
        throw new Error("No se encontró el producto seleccionado");
      }

      const actualizado = await api.actualizarProducto(producto, cambios);
      store.actualizarProducto(id, actualizado);
      aplicarFiltros();
      renderizarInicio();
      await historial.recargar();
    },
  });

  crearModalEscaner({
    store,
    onProductoEncontrado: (producto) => modalStock.abrir(producto),
  });

  function renderizarInventario() {
    tablaInventario.render(
      store.obtenerPaginaProductos(),
      store.obtenerUmbrales(),
    );
    paginacionInventario.render(
      store.obtenerPaginaActual(),
      store.obtenerTotalPaginas(),
    );
  }

  function renderizarProveedores() {
    tablaProveedores.render(store.obtenerPaginaProveedores());
    paginacionProveedores.render(
      store.obtenerPaginaProvActual(),
      store.obtenerTotalPaginasProv(),
    );
  }

  function renderizarInicio() {
    renderizarInicioRepositor({
      productos: store.obtenerProductos(),
      umbralesStock: store.obtenerUmbrales(),
      nombreUsuario:
        document.getElementById("nombre-rol")?.textContent?.trim() ||
        "Repositor",
      onReponerClick: (producto) => modalStock.abrir(producto),
      onIrAInventario: () =>
        document.querySelector('[data-nav="inventario"]')?.click(),
    });
  }

  function aplicarFiltros() {
    store.filtrarProductos({
      termino: inputBuscador?.value || "",
      estadoStock: selectSemaforo?.value || "",
    });
    renderizarInventario();
  }

  function aplicarFiltroProveedores() {
    store.filtrarProveedores({ termino: inputBuscadorProv?.value || "" });
    renderizarProveedores();
  }

  const tablaInventarioEl = document
    .getElementById("tabla-base-body")
    ?.closest("table");

  tablaInventarioEl?.querySelectorAll(".sortable").forEach((cabecera) => {
    cabecera.addEventListener("click", () => {
      const columna = cabecera.getAttribute("data-sort");
      store.ordenarProductos(columna);
      renderizarInventario();
    });
  });

  document.querySelectorAll("#proveedores .sortable").forEach((cabecera) => {
    cabecera.addEventListener("click", () => {
      const columna = cabecera.getAttribute("data-sort");
      store.ordenarProveedores(columna);
      renderizarProveedores();
    });
  });

  conectarFiltrosInventario({
    inputBuscador,
    selectSemaforo,
    inputBuscadorProv,
    onFiltrarProductos: aplicarFiltros,
    onFiltrarProveedores: aplicarFiltroProveedores,
  });

  iniciarNavegacionVistas();
  document
    .querySelector('[data-nav="movimientos"]')
    ?.addEventListener("click", () => {
      historial.recargar();
    });

  renderizarInventario();
  renderizarProveedores();
  renderizarInicio();

  api
    .listarProductos()
    .then((productos) => {
      store.establecerInventario(productos);
      aplicarFiltros();
      renderizarInicio();
    })
    .catch((error) => {
      console.error("Error cargando los productos:", error);
      mostrarToast("No se pudieron cargar los productos", true);
    });

  api
    .listarProveedores()
    .then((proveedores) => {
      store.establecerProveedores(proveedores);
      aplicarFiltroProveedores();
    })
    .catch((error) => {
      console.error("Error cargando los proveedores:", error);
      mostrarToast("No se pudieron cargar los proveedores", true);
    });

  api
    .cargarUmbralesStock()
    .then((umbrales) => {
      store.establecerUmbrales(umbrales);
      aplicarFiltros();
      renderizarInicio();
    })
    .catch((error) => {
      console.error("Error cargando los umbrales de stock:", error);
      mostrarToast("No se pudieron cargar los umbrales de stock", true);
    });
}

document.addEventListener("DOMContentLoaded", iniciarArticulos);
