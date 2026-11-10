import { mostrarToast } from "../common/utils/alertas.js";
let catalogoBase = [];
let catalogoEdicion = [];

// Paginación Backend
let paginaActual = 1;
const itemsPorPagina = 12;
let totalPaginasBackend = 1;
let totalProductosBackend = 0;

// Lógica de Dólar y Borrador
let ultimoDolarGuardado = null;
let dolarApiEnVivo = null;
let historialCambios = [];
let hayCambiosSinGuardar = false;
let operacionMasivaPendiente = null; // Guarda qué cálculo mandar al backend si aprietan Guardar
let htmlOriginalBotonGuardar = "";

const tablaBodyPrecios = document.getElementById("tabla-body-precios");

// Dashboard
const spanDolarSistema = document.getElementById("dolar-sistema-actual");
const spanDolarVivo = document.getElementById("dolar-api-vivo");
const spanAlertaDolar = document.getElementById("alerta-dolar");
const spanEjemploNombre = document.getElementById("ejemplo-nombre");
const spanEjemploViejo = document.getElementById("ejemplo-viejo");
const spanEjemploNuevo = document.getElementById("ejemplo-nuevo");

// Funciones auxiliares y dashboard
function redondearPrecio(precio) {
  return Math.round(precio / 10) * 10;
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

function actualizarDashboard(simulacionMonto = null) {
  spanDolarSistema.textContent = `$${ultimoDolarGuardado || "---"}`;

  if (dolarApiEnVivo && ultimoDolarGuardado !== dolarApiEnVivo) {
    spanAlertaDolar.style.display = "inline-block";
  } else {
    spanAlertaDolar.style.display = "none";
  }

  if (catalogoBase.length > 0) {
    const prodBase = catalogoBase[0];
    const prodBorrador = catalogoEdicion[0];

    spanEjemploNombre.textContent = prodBase.nombre;
    spanEjemploViejo.textContent = `$ ${(prodBase.precioArs ?? 0).toLocaleString("es-AR")}`;

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

// Conexión con el backend
async function cargarProductosDesdeBackend() {
  const inputBuscador = document.getElementById("buscar-producto");
  const termino = inputBuscador ? inputBuscador.value.trim() : "";

  let url = `/api/productos/?pagina=${paginaActual}&limite=${itemsPorPagina}`;
  let opcionesFetch = { method: "GET" };

  if (termino !== "") {
    opcionesFetch = {
      method: "QUERY",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: termino }),
    };
  }

  try {
    const respuesta = await fetch(url, opcionesFetch);
    if (!respuesta.ok) throw new Error("Error al traer productos");

    const resultado = await respuesta.json();
    const arrayProductos = resultado.productos || resultado.datos || resultado;

    totalPaginasBackend = resultado.totalPaginas;
    totalProductosBackend = resultado.total;

    const productosMapeados = arrayProductos.map((p) => {
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
        descripcion: p.descripcion || "",
      };
    });

    hayCambiosSinGuardar = false;
    operacionMasivaPendiente = null;
    historialCambios = [];
    catalogoEdicion = productosMapeados;

    if (catalogoBase.length === 0) catalogoBase = [...productosMapeados];

    renderizarTablaPrecios();
    actualizarDashboard();
  } catch (error) {
    console.error("Error cargando tabla desde el backend:", error);
  }
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

// Renderizazo y paginación
function renderizarTablaPrecios() {
  if (!tablaBodyPrecios) return;
  tablaBodyPrecios.innerHTML = "";

  catalogoEdicion.forEach((prod) => {
    const fila = document.createElement("tr");
    const clasePrecio = hayCambiosSinGuardar
      ? "td-ars precio-borrador"
      : "td-ars";

    fila.innerHTML = `
      <td class="td-codigo">${prod.id}</td>
      <td class="td-nombre">${prod.nombre}</td>
      <td class="td-usd">U$D ${prod.precioUsd.toFixed(2)}</td>
      <td class="${clasePrecio}">$ ${(prod.precioArs ?? 0).toLocaleString("es-AR")}</td>
      <td>
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

function actualizarControlesPaginacion() {
  const contenedorNumeros = document.getElementById(
    "numeros-paginacion-precios",
  );
  const btnAnterior = document.getElementById("btn-anterior-precios");
  const btnSiguiente = document.getElementById("btn-siguiente-precios");
  const spanInfoTotal = document.getElementById("info-total-productos");

  if (!contenedorNumeros) return;

  if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
  if (btnSiguiente)
    btnSiguiente.disabled = paginaActual === totalPaginasBackend;
  if (spanInfoTotal)
    spanInfoTotal.textContent = `Mostrando página ${paginaActual} de ${totalPaginasBackend} (${totalProductosBackend} en total)`;

  contenedorNumeros.innerHTML = "";

  for (let i = 1; i <= totalPaginasBackend; i++) {
    const btnNumero = document.createElement("button");
    btnNumero.className = `btn-fantasma ${i === paginaActual ? "active" : ""}`;
    btnNumero.textContent = i;

    btnNumero.addEventListener("click", () => {

      if (hayCambiosSinGuardar) {
        return mostrarToast(
          "Por favor, guardá o deshacé la prueba antes de cambiar de página",
          true,
        );
      }
      paginaActual = i;
      cargarProductosDesdeBackend();
    });

    contenedorNumeros.appendChild(btnNumero);
  }
}

function aplicarFiltros() {
  paginaActual = 1;
  cargarProductosDesdeBackend();
}

// Inicializacion y eventos del DOM
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  const btnGuardarCambios = document.getElementById("btn-guardar-cambios");
  if (btnGuardarCambios) htmlOriginalBotonGuardar = btnGuardarCambios.innerHTML;

  await cargarProductosDesdeBackend();
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
      if (hayCambiosSinGuardar)
        return mostrarToast("Guardá o deshacé la prueba primero", true);
      if (paginaActual > 1) {
        paginaActual--;
        cargarProductosDesdeBackend();
      }
    });

    btnSiguiente.addEventListener("click", () => {
      if (hayCambiosSinGuardar)
        return mostrarToast("Guardá o deshacé la prueba primero", true);
      if (paginaActual < totalPaginasBackend) {
        paginaActual++;
        cargarProductosDesdeBackend();
      }
    });
  }

  // --- Botones de Control de Precios (Borrador Visual) ---
  const btnAplicarDolar = document.getElementById("btn-aplicar-dolar");
  const btnAplicarPorcentaje = document.getElementById(
    "btn-aplicar-porcentaje",
  );
  const inputPorcentaje = document.getElementById("input-porcentaje");
  const btnDeshacer = document.getElementById("btn-deshacer");

  if (btnAplicarDolar) {
    btnAplicarDolar.addEventListener("click", () => {
      if (!dolarApiEnVivo)
        return mostrarToast("Cotización no disponible aún.", true);
      guardarEnHistorial();

      catalogoEdicion = catalogoEdicion.map((prod) => ({
        ...prod,
        precioArs: redondearPrecio(prod.precioUsd * dolarApiEnVivo),
      }));

      operacionMasivaPendiente = { tipo: "dolar", valor: dolarApiEnVivo };

      renderizarTablaPrecios();
      actualizarDashboard();
    });
  }

  if (inputPorcentaje) {
    inputPorcentaje.addEventListener("input", (e) => {
      const porcentaje = parseFloat(e.target.value);
      if (!isNaN(porcentaje)) {
        const precioActualBase = catalogoBase[0]?.precioArs || 0;
        const impacto = redondearPrecio(
          precioActualBase * (1 + porcentaje / 100),
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


      operacionMasivaPendiente = { tipo: "porcentaje", valor: porcentaje };
      inputPorcentaje.value = "";

      renderizarTablaPrecios();
      actualizarDashboard();
    });
  }

  if (btnDeshacer) {
    btnDeshacer.addEventListener("click", () => {
      if (historialCambios.length > 0) {
        catalogoEdicion = historialCambios.pop();
        if (historialCambios.length === 0) {
          btnDeshacer.disabled = true;
          hayCambiosSinGuardar = false;
          operacionMasivaPendiente = null;
        }
        renderizarTablaPrecios();
        actualizarDashboard();
      }
    });
  }

  // --- BOTÓN GUARDAR CAMBIOS MASIVOS ---
  if (btnGuardarCambios) {
    btnGuardarCambios.addEventListener("click", () => {
      if (!operacionMasivaPendiente) return;

      confirmarPublicacion(async () => {
        try {
          const respuesta = await fetch("/api/productos/actualizar-precios", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(operacionMasivaPendiente),
          });

          if (!respuesta.ok) throw new Error("Error guardando en servidor");

          // Reset de botones
          historialCambios = [];
          hayCambiosSinGuardar = false;
          operacionMasivaPendiente = null;
          if (btnDeshacer) btnDeshacer.disabled = true;

          btnGuardarCambios.innerHTML = `<i data-lucide="check-circle"></i> ¡Precios Publicados!`;
          btnGuardarCambios.style.backgroundColor = "#c7ff3e";
          btnGuardarCambios.style.borderColor = "#c7ff3e";
          btnGuardarCambios.style.color = "#161615";

          mostrarToast("¡El catálogo se actualizó exitosamente!");

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

          await cargarProductosDesdeBackend();
        } catch (error) {
          console.error(error);
          mostrarToast("Hubo un error al publicar los cambios.", true);
        }
      });
    });
  }
});


// Modal editar producto
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

      modalStock.close();
      mostrarToast("¡Producto actualizado con éxito!");

      await cargarProductosDesdeBackend();
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

      modalCrear.close();
      mostrarToast("¡Producto creado y guardado con éxito!");

      paginaActual = 1;
      await cargarProductosDesdeBackend();
    } catch (error) {
      console.error(error);
      mostrarToast("Hubo un error al crear el producto.", true);
    }
  });
}
