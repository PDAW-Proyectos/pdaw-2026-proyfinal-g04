let catalogoBase = [];
let catalogoEdicion = []; 
let productosFiltrados = []; 

// Paginación 
let paginaActual = 1;
const itemsPorPagina = 12;

// Lógica de Dólar y Borrador
let ultimoDolarGuardado = 1000;
let dolarApiEnVivo = null;
let historialCambios = [];
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
    // Usamos tu clase btn-fantasma y le sumamos active si es la página actual
    btnNumero.className = `btn-fantasma ${i === paginaActual ? "active" : ""}`;
    btnNumero.textContent = i;

    btnNumero.addEventListener("click", () => {
      paginaActual = i;
      renderizarTablaPrecios();
    });

    contenedorNumeros.appendChild(btnNumero);
  }
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
      <td class="${clasePrecio}">$ ${prod.precioArs.toLocaleString("es-AR")}</td>
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

// Filtros
function aplicarFiltros() {
  const inputBuscador = document.getElementById("buscar-producto");
  const termino = inputBuscador ? inputBuscador.value.toLowerCase() : "";

  productosFiltrados = catalogoEdicion.filter((prod) => {
    return (
      prod.nombre.toLowerCase().includes(termino) ||
      prod.id.toLowerCase().includes(termino)
    );
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
  if (btnGuardarCambios) btnGuardarCambios.disabled = !hayCambiosSinGuardar;
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
    const respuesta = await fetch("https://dolarapi.com/v1/dolares/blue");
    const data = await respuesta.json();
    dolarApiEnVivo = data.venta;
    spanDolarVivo.textContent = `$ ${dolarApiEnVivo}`;
    actualizarDashboard();
  } catch (error) {
    console.error("Error al consultar DolarAPI:", error);
    spanDolarVivo.textContent = "Error de red";
  }
}

// Inicialización y eventos del DOM
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  try {
    const respuesta = await fetch("/api/productos");
    if (respuesta.ok) {
      const data = await respuesta.json();
      catalogoBase = data.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria || "General",
        precioUsd: p.precioUsd ?? p.precio / 1000, // Si en la base de datos está en pesos, estimamos USD o usamos su campo real
        precioArs: p.precio ?? p.precioArs,
        stock: p.stock ?? 0,
      }));
      catalogoEdicion = JSON.parse(JSON.stringify(catalogoBase));
    }
  } catch (error) {
    console.error("Error al conectar con el backend de productos:", error);
  }
  // Arranque
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
  const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

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
    btnGuardarCambios.addEventListener("click", async () => {
      try {
        // Mandamos el catálogo editado al servidor
        const respuesta = await fetch("/api/productos/actualizar-precios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catalogoEdicion),
        });

        if (!respuesta.ok) throw new Error("Error al guardar en el servidor");

        catalogoBase = JSON.parse(JSON.stringify(catalogoEdicion));
        if (dolarApiEnVivo) ultimoDolarGuardado = dolarApiEnVivo;

        historialCambios = [];
        hayCambiosSinGuardar = false;
        btnDeshacer.disabled = true;

        const iconoOriginal = btnGuardarCambios.innerHTML;
        btnGuardarCambios.innerHTML = `<i data-lucide="check-circle"></i> ¡Precios Publicados!`;
        btnGuardarCambios.style.backgroundColor = "#15803d";
        btnGuardarCambios.style.borderColor = "#15803d";

        aplicarFiltros();
        actualizarDashboard();

        setTimeout(() => {
          btnGuardarCambios.innerHTML = iconoOriginal;
          btnGuardarCambios.style.backgroundColor = "#2563eb";
          btnGuardarCambios.style.borderColor = "#2563eb";
          btnGuardarCambios.disabled = true;
          if (typeof lucide !== "undefined") lucide.createIcons();
        }, 2500);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al guardar los cambios en la base de datos.");
      }
    });
  }
});
