let catalogoBase = [];
let catalogoEdicion = [];
let productosFiltrados = [];

// Paginación
let paginaActual = 1;
const itemsPorPagina = 12;

// Lógica de Dólar y Borrador
let ultimoDolarGuardado = null;
let dolarApiEnVivo = null;
let historialCambios = [];
// let fechaCotizacionActual = null;
let hayCambiosSinGuardar = false;

const tablaBodyPrecios = document.getElementById("tabla-body-precios");

// Dashboard
const spanDolarSistema = document.getElementById("dolar-sistema-actual");
const spanDolarVivo = document.getElementById("dolar-api-vivo");
const spanAlertaDolar = document.getElementById("alerta-dolar");
const spanEjemploNombre = document.getElementById("ejemplo-nombre");
const spanEjemploViejo = document.getElementById("ejemplo-viejo");
const spanEjemploNuevo = document.getElementById("ejemplo-nuevo");

// Funciones de dibujado y lógica

function redondearPrecio(precio) {
  return Math.round(precio / 10) * 10;
}

function actualizarControlesPaginacion() {
  const contenedorNumeros = document.getElementById(
    "numeros-paginacion-precios",
  );
  const btnAnterior = document.getElementById("btn-anterior-precios");
  const btnSiguiente = document.getElementById("btn-siguiente-precios");
  const spanInfoTotal = document.getElementById("info-total-productos");

  if (!contenedorNumeros) return;

  const totalPaginas =
    Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;

  if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
  if (btnSiguiente) btnSiguiente.disabled = paginaActual === totalPaginas;
  if (spanInfoTotal)
    spanInfoTotal.textContent = `Mostrando ${productosFiltrados.length} productos`;

  contenedorNumeros.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btnNumero = document.createElement("button");
    btnNumero.className = `btn-fantasma ${i === paginaActual ? "active" : ""}`;
    btnNumero.textContent = i;

    btnNumero.addEventListener("click", () => {
      paginaActual = i;
      renderizarTablaPrecios();
    });

    contenedorNumeros.appendChild(btnNumero);
  }
}

let htmlOriginalBotonGuardar = "";

export function mostrarToast(mensaje, esError = false) {
  const toast = document.createElement("div");
  toast.textContent = mensaje;

  toast.className = `toast-notificacion ${esError ? "toast-error" : "toast-exito"}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast-visible"));

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function confirmarPublicacion(accionConfirmada) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal-base";
  dialog.innerHTML = `
   <div class="modal-contenido">
      <div class="modal-header">
        <h2>Confirmar publicación</h2>
      </div>
      <p class="modal-subtitle">Estás a punto de actualizar los precios de todo el catálogo en el sistema.</p>
      
      <div class="modal-acciones" style="margin-top: 24px;">
        <button type="button" class="btn-fantasma" id="btn-cancelar-pub">Cancelar</button>
        <button type="button" class="btn-primario" id="btn-confirmar-pub" style="background-color: #c7ff3e; border-color: #c7ff3e; color: #161615;">Sí, publicar</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.querySelector("#btn-cancelar-pub").addEventListener("click", () => {
    dialog.close();
    dialog.remove();
  });

  dialog.querySelector("#btn-confirmar-pub").addEventListener("click", () => {
    dialog.close();
    dialog.remove();
    accionConfirmada();
  });
}

// Render tabla
function renderizarTablaPrecios() {
  if (!tablaBodyPrecios) return;

  // Matemática del paginado
  const totalPaginas =
    Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);

  tablaBodyPrecios.innerHTML = "";

  productosPagina.forEach((prod) => {
    const fila = document.createElement("tr");
    const clasePrecio = hayCambiosSinGuardar
      ? "td-ars precio-borrador"
      : "td-ars";

    fila.innerHTML = `
      <td class="td-codigo">${prod.id}</td>
      <td class="td-nombre">${prod.nombre}</td>
      <td class="td-usd">U$D ${prod.precioUsd.toFixed(2)}</td>
      <td class="${clasePrecio}">$ ${(prod.precioArs ?? 0).toLocaleString("es-AR")}</td>
        <button type="button" class="btn-primario btn-chico" data-id="${prod.id}">
          <i data-lucide="square-pen" class="icono-chico"></i> 
        </button>
      </td>
    `;
    tablaBodyPrecios.appendChild(fila);
  });

  actualizarControlesPaginacion();
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Filtros
function aplicarFiltros() {
  const inputBuscador = document.getElementById("buscar-producto");
  const termino = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";

  productosFiltrados = catalogoEdicion.filter((prod) => {
    const idTexto = prod.id ? prod.id.toString().toLowerCase() : "";
    const nombreTexto = prod.nombre ? prod.nombre.toLowerCase() : "";

    return nombreTexto.includes(termino) || idTexto.includes(termino);
  });

  paginaActual = 1;
  renderizarTablaPrecios();
}

// Dashboard Financiero
function actualizarDashboard(simulacionMonto = null) {
  spanDolarSistema.textContent = `$${ultimoDolarGuardado}`;

  if (dolarApiEnVivo && ultimoDolarGuardado !== dolarApiEnVivo) {
    spanAlertaDolar.style.display = "inline-block";
  } else {
    spanAlertaDolar.style.display = "none";
  }

  if (catalogoBase.length > 0) {
    const prodBase = catalogoBase[0];
    const prodBorrador = catalogoEdicion[0];

    spanEjemploNombre.textContent = prodBase.nombre;
    spanEjemploViejo.textContent = `$ ${prodBase.precioArs.toLocaleString("es-AR")}`;

    if (simulacionMonto !== null) {
      spanEjemploNuevo.textContent = `$ ${simulacionMonto.toLocaleString("es-AR")}`;
      spanEjemploNuevo.style.color = "#759627";
    } else if (hayCambiosSinGuardar) {
      spanEjemploNuevo.textContent = `$ ${prodBorrador.precioArs.toLocaleString("es-AR")}`;
      spanEjemploNuevo.style.color = "#059669";
    } else if (dolarApiEnVivo && ultimoDolarGuardado !== dolarApiEnVivo) {
      const impactoDolar = redondearPrecio(prodBase.precioUsd * dolarApiEnVivo);
      spanEjemploNuevo.textContent = `$ ${impactoDolar.toLocaleString("es-AR")} (Por dólar)`;
      spanEjemploNuevo.style.color = "#759627";
    } else {
      spanEjemploNuevo.textContent = "---";
      spanEjemploNuevo.style.color = "#759627";
    }
  }

  const btnGuardarCambios = document.getElementById("btn-guardar-cambios");
  if (btnGuardarCambios) {
    btnGuardarCambios.disabled = !hayCambiosSinGuardar;

    if (hayCambiosSinGuardar && htmlOriginalBotonGuardar) {
      btnGuardarCambios.innerHTML = htmlOriginalBotonGuardar;
      btnGuardarCambios.style.backgroundColor = "";
      btnGuardarCambios.style.borderColor = "";
      btnGuardarCambios.style.color = "";
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

function guardarEnHistorial() {
  const copiaBorrador = JSON.parse(JSON.stringify(catalogoEdicion));
  historialCambios.push(copiaBorrador);

  const btnDeshacer = document.getElementById("btn-deshacer");
  if (btnDeshacer) btnDeshacer.disabled = false;
  hayCambiosSinGuardar = true;
}

async function consultarDolarEnVivo() {
  try {
    const respuesta = await fetch("/api/cotizacion");
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    const data = await respuesta.json();
    dolarApiEnVivo = data.cotizacion?.venta ?? data.venta;
    if (typeof dolarApiEnVivo !== "number") {
      throw new Error(
        "La respuesta de cotización no contiene una venta válida",
      );
    }

    if (!ultimoDolarGuardado) ultimoDolarGuardado = dolarApiEnVivo;

    spanDolarVivo.textContent = `$ ${dolarApiEnVivo}`;
    actualizarDashboard();
  } catch (error) {
    console.error("Error al consultar DolarAPI desde el backend:", error);
    spanDolarVivo.textContent = "Error de red";
  }
}

// Inicialización y eventos del DOM
document.addEventListener("DOMContentLoaded", async () => {
  const btnGuardarCambios = document.getElementById("btn-guardar-cambios");
  if (btnGuardarCambios) htmlOriginalBotonGuardar = btnGuardarCambios.innerHTML;

  if (typeof lucide !== "undefined") lucide.createIcons();

  try {
    const respuesta = await fetch("/api/productos");
    if (respuesta.ok) {
      const data = await respuesta.json();

      const listaProductos = data.productos || data;

      catalogoBase = listaProductos.map((p) => {
        const usd = p.precioUsd ?? 0;
        const cotizacionProducto = Number(p.cotizacion ?? 0);
        const arsCalculado =
          p.precio ??
          p.precioArs ??
          (cotizacionProducto > 0
            ? redondearPrecio(usd * cotizacionProducto)
            : 0);

        return {
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria || "General",
          precioUsd: usd,
          precioArs: arsCalculado,
          stock: p.stock ?? p.unidad ?? p.peso ?? 0,
        };
      });

      catalogoEdicion = JSON.parse(JSON.stringify(catalogoBase));
    }
  } catch (error) {
    console.error("Error al conectar con el backend de productos:", error);
  }
  aplicarFiltros();
  actualizarDashboard();
  consultarDolarEnVivo();

  // --- Vistas ---
  const enlaces = document.querySelectorAll(".nav-enlace");
  const vistas = document.querySelectorAll(".vista");

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = enlace.getAttribute("data-nav");
      if (!targetId) return;

      enlaces.forEach((link) => link.classList.remove("active"));
      vistas.forEach((vista) => vista.classList.remove("active"));

      enlace.classList.add("active");
      const vistaDestino = document.getElementById(targetId);
      if (vistaDestino) vistaDestino.classList.add("active");
    });
  });

  // --- Buscador ---
  const inputBuscador = document.getElementById("buscar-producto");
  if (inputBuscador) inputBuscador.addEventListener("input", aplicarFiltros);

  // --- Paginación ---
  const btnAnterior = document.getElementById("btn-anterior-precios");
  const btnSiguiente = document.getElementById("btn-siguiente-precios");

  if (btnAnterior && btnSiguiente) {
    btnAnterior.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual--;
        renderizarTablaPrecios();
      }
    });

    btnSiguiente.addEventListener("click", () => {
      const totalPaginas = Math.ceil(
        productosFiltrados.length / itemsPorPagina,
      );
      if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarTablaPrecios();
      }
    });
  }

  // --- Botones de Control de Precios ---
  const btnAplicarDolar = document.getElementById("btn-aplicar-dolar");
  const btnAplicarPorcentaje = document.getElementById(
    "btn-aplicar-porcentaje",
  );
  const inputPorcentaje = document.getElementById("input-porcentaje");
  const btnDeshacer = document.getElementById("btn-deshacer");

  if (btnAplicarDolar) {
    btnAplicarDolar.addEventListener("click", () => {
      if (!dolarApiEnVivo) return;
      guardarEnHistorial();
      catalogoEdicion = catalogoEdicion.map((prod) => ({
        ...prod,
        precioArs: redondearPrecio(prod.precioUsd * dolarApiEnVivo),
      }));
      aplicarFiltros();
      actualizarDashboard();
    });
  }

  if (inputPorcentaje) {
    inputPorcentaje.addEventListener("input", (e) => {
      const porcentaje = parseFloat(e.target.value);
      if (!isNaN(porcentaje)) {
        const precioActualBorrador = catalogoEdicion[0].precioArs;
        const impacto = redondearPrecio(
          precioActualBorrador * (1 + porcentaje / 100),
        );
        actualizarDashboard(impacto);
      } else {
        actualizarDashboard(null);
      }
    });
  }

  if (btnAplicarPorcentaje) {
    btnAplicarPorcentaje.addEventListener("click", () => {
      const porcentaje = parseFloat(inputPorcentaje.value);
      if (isNaN(porcentaje) || porcentaje === 0) return;
      guardarEnHistorial();
      catalogoEdicion = catalogoEdicion.map((prod) => ({
        ...prod,
        precioArs: redondearPrecio(prod.precioArs * (1 + porcentaje / 100)),
      }));
      inputPorcentaje.value = "";
      aplicarFiltros();
      actualizarDashboard();
    });
  }

  if (btnDeshacer) {
    btnDeshacer.addEventListener("click", () => {
      if (historialCambios.length > 0) {
        catalogoEdicion = historialCambios.pop();
        if (historialCambios.length === 0) {
          btnDeshacer.disabled = true;
          const esIgualALaBase =
            JSON.stringify(catalogoEdicion) === JSON.stringify(catalogoBase);
          hayCambiosSinGuardar = !esIgualALaBase;
        }
        aplicarFiltros();
        actualizarDashboard();
      }
    });
  }

  if (btnGuardarCambios) {
    btnGuardarCambios.addEventListener("click", () => {
      // Usamos el modal de confirmación
      confirmarPublicacion(async () => {
        try {
          const payload = {
            productos: catalogoEdicion.map((p) => p.id),
          };

          const respuesta = await fetch("/api/productos/actualizar-precios", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!respuesta.ok) throw new Error("Error al guardar en el servidor");

          catalogoBase = JSON.parse(JSON.stringify(catalogoEdicion));
          if (dolarApiEnVivo) ultimoDolarGuardado = dolarApiEnVivo;

          historialCambios = [];
          hayCambiosSinGuardar = false;
          btnDeshacer.disabled = true;

          btnGuardarCambios.innerHTML = `<i data-lucide="check-circle"></i> ¡Precios Publicados!`;
          btnGuardarCambios.style.backgroundColor = "#c7ff3e";
          btnGuardarCambios.style.borderColor = "#c7ff3e";
          btnGuardarCambios.style.color = "#161615";

          aplicarFiltros();
          actualizarDashboard();
          mostrarToast("¡Los precios se actualizaron correctamente!");

          setTimeout(() => {
            if (!hayCambiosSinGuardar && htmlOriginalBotonGuardar) {
              btnGuardarCambios.innerHTML = htmlOriginalBotonGuardar;
              btnGuardarCambios.style.backgroundColor = "";
              btnGuardarCambios.style.borderColor = "";
              btnGuardarCambios.style.color = "";
              btnGuardarCambios.disabled = true;
              if (typeof lucide !== "undefined") lucide.createIcons();
            }
          }, 2500);
        } catch (error) {
          console.error(error);
          mostrarToast(
            "Hubo un error al guardar los cambios en la base de datos.",
            true,
          );
        }
      });
    });
  }
});

// --- Modal Actualizar Precio / Producto ---
const modalStock = document.getElementById("modal-stock");
const formStock = document.getElementById("form-stock");
const btnCerrarModal = document.getElementById("cerrar-modal");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");

let productoEnEdicionId = null;

if (tablaBodyPrecios) {
  tablaBodyPrecios.addEventListener("click", (e) => {
    const btnEditar = e.target.closest("button");
    if (!btnEditar) return;

    const idProd = btnEditar.getAttribute("data-id");

    const producto = catalogoEdicion.find(
      (p) => String(p.id) === String(idProd),
    );

    if (producto) {
      productoEnEdicionId = producto.id;
      document.getElementById("modal-producto-id").value = producto.id;
      document.getElementById("modal-nombre-producto").textContent =
        producto.nombre;
      document.getElementById("modal-precio-usd").value = producto.precioUsd;
      document.getElementById("modal-precio-ars").value = producto.precioArs;
      document.getElementById("nueva-descripcion").value =
        producto.descripcion || "";

      if (modalStock && typeof modalStock.showModal === "function") {
        modalStock.showModal();
      }
    }
  });
}

[btnCerrarModal, btnCancelarModal].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      if (modalStock) modalStock.close();
    });
  }
});

const inputUsdModal = document.getElementById("modal-precio-usd");
const inputArsModal = document.getElementById("modal-precio-ars");

if (inputUsdModal && dolarApiEnVivo) {
  inputUsdModal.addEventListener("input", (e) => {
    const valUsd = parseFloat(e.target.value) || 0;
    inputArsModal.value = redondearPrecio(valUsd * dolarApiEnVivo);
  });
}

if (formStock) {
  formStock.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!productoEnEdicionId) return;

    const nuevoPrecioUsd = parseFloat(
      document.getElementById("modal-precio-usd").value,
    );
    const nuevoPrecioArs = parseFloat(
      document.getElementById("modal-precio-ars").value,
    );
    const nuevaDescripcion = document.getElementById("nueva-descripcion").value;

    try {
      const payload = {
        precioUsd: nuevoPrecioUsd,
        precio: nuevoPrecioArs,
        descripcion: nuevaDescripcion,
      };

      const respuesta = await fetch(`/api/productos/${productoEnEdicionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!respuesta.ok) throw new Error("Error al actualizar el producto");

      const productoActualizadoServidor = await respuesta.json();

      catalogoEdicion = catalogoEdicion.map((p) => {
        if (String(p.id) === String(productoEnEdicionId)) {
          return {
            ...p,
            precioUsd: productoActualizadoServidor.precioUsd ?? nuevoPrecioUsd,
            precioArs: productoActualizadoServidor.precio ?? nuevoPrecioArs,
            descripcion:
              productoActualizadoServidor.descripcion ?? nuevaDescripcion,
          };
        }
        return p;
      });

      catalogoBase = JSON.parse(JSON.stringify(catalogoEdicion));

      modalStock.close();
      aplicarFiltros();
      actualizarDashboard();
      mostrarToast("¡Producto actualizado con éxito!");
    } catch (error) {
      console.error(error);
      mostrarToast("Hubo un error al actualizar el producto.", true);
    }
  });
}

// --- Modal Crear Producto Nuevo ---
const modalCrear = document.getElementById("modal-crear-producto");
const formCrear = document.getElementById("form-crear-producto");
const btnCerrarCrear = document.getElementById("cerrar-modal-crear");
const btnCancelarCrear = document.getElementById("btn-cancelar-crear");
const btnAbrirModalCrear =
  document.querySelector('[data-nav="vista-crear"]') ||
  document.getElementById("btn-nuevo-producto");

if (btnAbrirModalCrear) {
  btnAbrirModalCrear.addEventListener("click", (e) => {
    e.preventDefault();
    if (formCrear) formCrear.reset();
    if (modalCrear && typeof modalCrear.showModal === "function") {
      modalCrear.showModal();
    }
  });
}

[btnCerrarCrear, btnCancelarCrear].forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      if (modalCrear) modalCrear.close();
    });
  }
});

const inputUsdCrear = document.getElementById("nuevo-prod-usd");
const inputArsCrear = document.getElementById("nuevo-prod-ars");

if (inputUsdCrear && inputArsCrear) {
  inputUsdCrear.addEventListener("input", (e) => {
    const valUsd = parseFloat(e.target.value) || 0;
    if (dolarApiEnVivo) {
      inputArsCrear.value = redondearPrecio(valUsd * dolarApiEnVivo);
    }
  });
}

if (formCrear) {
  formCrear.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre: document.getElementById("nuevo-prod-nombre").value,
      categoria: document.getElementById("nuevo-prod-categoria").value,
      precioUsd: parseFloat(inputUsdCrear.value),
      precio: parseFloat(inputArsCrear.value),
      unidad: parseInt(document.getElementById("nuevo-prod-stock").value) || 0,
      descripcion: document.getElementById("nuevo-prod-descripcion").value,
    };

    try {
      const respuesta = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });

      if (!respuesta.ok)
        throw new Error("Error al crear el producto en el servidor");

      const productoCreadoServidor = await respuesta.json();

      const productoFormateado = {
        id: productoCreadoServidor.id,
        nombre: productoCreadoServidor.nombre,
        categoria: productoCreadoServidor.categoria || "General",
        precioUsd: productoCreadoServidor.precioUsd ?? nuevoProducto.precioUsd,
        precioArs: productoCreadoServidor.precio ?? nuevoProducto.precio,
        stock:
          productoCreadoServidor.stock ??
          productoCreadoServidor.unidad ??
          productoCreadoServidor.peso ??
          0,
        descripcion: productoCreadoServidor.descripcion,
      };

      catalogoBase.push(productoFormateado);
      catalogoEdicion = JSON.parse(JSON.stringify(catalogoBase));

      modalCrear.close();
      aplicarFiltros();
      actualizarDashboard();
      mostrarToast("¡Producto creado y guardado con éxito!");
      if (typeof lucide !== "undefined") lucide.createIcons();
    } catch (error) {
      console.error(error);
      mostrarToast("Hubo un error al crear el producto.", true);
    }
  });
}
