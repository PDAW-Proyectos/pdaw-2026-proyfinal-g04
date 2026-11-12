const modalDescuento = document.getElementById("modal-descuento");
const inputValorMod = document.getElementById("input-valor-mod");
const indicadorTipoValor = document.getElementById("tipo-valor");
const prevSubtotal = document.getElementById("prev-subtotal");
const prevNuevoTotal = document.getElementById("prev-nuevo-total");

const formatearPrecio = (valor) =>
  `$ ${valor.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// =========================================
//  Navegación entre vistas del main
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const enlaces = document.querySelectorAll(".nav-enlace");
  const vistas = document.querySelectorAll(".vista-tab");

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (event) => {
      event.preventDefault();

      const destino = enlace.dataset.nav;

      enlaces.forEach((item) => {
        item.classList.remove("active");
      });

      vistas.forEach((vista) => {
        vista.classList.remove("activa");
      });

      enlace.classList.add("active");

      const vistaSeleccionada = document.getElementById(destino);

      if (vistaSeleccionada) {
        vistaSeleccionada.classList.add("activa");
      }
    });
  });
});

let estadoModificador = "descuento";
let subtotalActual = 0;
let carritoActual = [];

document.addEventListener("DOMContentLoaded", () => {
  // Modal pausa
  const modalPausa = document.getElementById("modal-pausa");
  const contenedorPausadas = document.getElementById(
    "contenedor-ventas-pausadas",
  );
  const btnConfirmarPausa = document.getElementById("btn-confirmar-pausa");

  // Modal descuento
  const btnConfirmarDescuento = document.getElementById(
    "btn-confirmar-descuento",
  );

  const ventasPausadas = [];

  ////////////////////////////////////
  // Modal de pausa y ventas pausadas
  ////////////////////////////////////

  // Funciones de vista y estado
  const cerrarModalPausa = () => {
    modalPausa.classList.add("modal-oculto");
    modalPausa.setAttribute("aria-hidden", "true");
  };

  const abrirModalPausa = () => {
    renderizarVentasPausadas();
    modalPausa.classList.remove("modal-oculto");
    modalPausa.setAttribute("aria-hidden", "false");
  };

  const actualizarEstadoBotonPausa = () => {
    const hayVentaActual = carritoActual.length > 0;
    if (btnConfirmarPausa) {
      btnConfirmarPausa.disabled = !hayVentaActual;
      btnConfirmarPausa.style.opacity = hayVentaActual ? "1" : "0.5";
      btnConfirmarPausa.style.cursor = hayVentaActual
        ? "pointer"
        : "not-allowed";
    }
  };

  const renderizarVentasPausadas = () => {
    if (ventasPausadas.length === 0) {
      contenedorPausadas.innerHTML =
        '<p class="estado-vacio-pausa">No hay ventas pausadas en este momento.</p>';
      return;
    }

    contenedorPausadas.innerHTML = "";
    ventasPausadas.forEach((pausa) => {
      const cantidadItems = pausa.items.reduce(
        (acc, item) => acc + item.cantidad,
        0,
      );
      const totalPrecio = pausa.items.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0,
      );

      const html = `
        <div class="venta-pausada-item">
          <div class="venta-pausada-info">
            <strong>Ticket en espera (${pausa.hora})</strong>
            <span>${cantidadItems} artículos - ${formatearPrecio(totalPrecio)}</span>
          </div>
          <button type="button" class="btn-recuperar" data-accion="recuperar-venta" data-id="${pausa.id}">
            Recuperar
          </button>
        </div>
      `;
      contenedorPausadas.insertAdjacentHTML("beforeend", html);
    });
  };

  const pausarVenta = () => {
    if (carritoActual.length === 0) return;

    ventasPausadas.push({
      id: Date.now(),
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      items: [...carritoActual],
    });

    carritoActual = [];
    actualizarEstadoBotonPausa();
    cerrarModalPausa();
    alert("Venta pausada. Podés atender al siguiente cliente");
  };

  const recuperarVenta = (id) => {
    if (carritoActual.length > 0) {
      alert(
        "Tenés una venta en curso. Pausala o cobrala antes de recuperar otra.",
      );
      return;
    }

    const indice = ventasPausadas.findIndex((venta) => venta.id === id);
    if (indice !== -1) {
      carritoActual = [...ventasPausadas[indice].items];
      ventasPausadas.splice(indice, 1);
      actualizarEstadoBotonPausa();
      cerrarModalPausa();
    }
  };

  document.addEventListener("click", (event) => {
    // 1. Abrir Modal
    if (event.target.closest('[data-accion="abrir-modal-pausa"]')) {
      abrirModalPausa();
      return;
    }

    // 2. Cerrar Modal
    if (event.target.closest('[data-accion="cerrar-modal-pausa"]')) {
      cerrarModalPausa();
      return;
    }

    // 3. Confirmar Pausa
    if (event.target.closest('[data-accion="confirmar-pausa"]')) {
      pausarVenta();
      return;
    }

    // 4. Recuperar Venta (Atrapa los botones generados dinámicamente)
    const btnRecuperar = event.target.closest(
      '[data-accion="recuperar-venta"]',
    );
    if (btnRecuperar) {
      const idVenta = Number(btnRecuperar.dataset.id);
      recuperarVenta(idVenta);
      return;
    }

    // Abrir Modal descuento
    if (event.target.closest('[data-accion="abrir-modal-descuento"]')) {
      if (carritoActual.length === 0) {
        mostrarNotificacion(
          "El changuito está vacío. Cargá productos primero.",
          "error",
        );
        return;
      }

      // Calcular subtotal actual del carrito
      subtotalActual = carritoActual.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0,
      );
      prevSubtotal.textContent = formatearPrecio(subtotalActual);
      inputValorMod.value = "";
      calcularPrevisualizacion();

      modalDescuento.classList.remove("modal-oculto");
      modalDescuento.setAttribute("aria-hidden", "false");
      setTimeout(() => inputValorMod.focus(), 100);
      return;
    }

    // Cerrar Modal descuento
    if (event.target.closest('[data-accion="cerrar-modal-descuento"]')) {
      modalDescuento.classList.add("modal-oculto");
      modalDescuento.setAttribute("aria-hidden", "true");
      return;
    }

    // Cambiar tipo de modificador (descuento o recargo)
    const btnTab = event.target.closest('[data-accion="set-tipo-mod"]');
    if (btnTab) {
      // Limpiar clases activas
      document
        .querySelectorAll(".tipo-modificador-tabs .tab-btn")
        .forEach((btn) => btn.classList.remove("activo"));
      btnTab.classList.add("activo");

      estadoModificador = btnTab.dataset.tipo; // "descuento" o "recargo"
      indicadorTipoValor.dataset.valor =
        estadoModificador === "descuento" ? "porcentaje" : "fijo";
      indicadorTipoValor.textContent =
        estadoModificador === "descuento" ? "%" : "$";
      calcularPrevisualizacion();
      return;
    }

    // Confirmar descuento o recargo
    if (event.target.closest('[data-accion="aplicar-modificador"]')) {
      const valorInput = parseFloat(inputValorMod.value) || 0;
      if (valorInput <= 0) {
        // Reemplazá el alert nativo por el nuevo Toast de error:
        mostrarNotificacion("Ingresá un monto mayor a 0", "error");
        return;
      }

      // Aplicar descuento o recargo al carritoActual
      alert(`${estadoModificador.toUpperCase()} aplicado con éxito.`);
      modalDescuento.classList.add("modal-oculto");
      modalDescuento.setAttribute("aria-hidden", "true");
      // actualizarVistaChanguito();
      return;
    }
  });

  // Inicialización de estado visual
  actualizarEstadoBotonPausa();
});

////////////////////
// Modal descuento
////////////////////

const calcularPrevisualizacion = () => {
  const valorInput = parseFloat(inputValorMod.value) || 0;

  // Ahora leemos el atributo data-valor del botón en lugar del select
  const esPorcentaje = indicadorTipoValor.dataset.valor === "porcentaje";
  let montoModificacion = 0;

  if (esPorcentaje) {
    montoModificacion = subtotalActual * (valorInput / 100);
  } else {
    montoModificacion = valorInput;
  }

  let nuevoTotal = subtotalActual;
  if (estadoModificador === "descuento") {
    nuevoTotal -= montoModificacion;
  } else {
    nuevoTotal += montoModificacion;
  }

  nuevoTotal = Math.max(0, nuevoTotal);
  prevNuevoTotal.textContent = formatearPrecio(nuevoTotal);
};

// (Mantenés el evento del input para cuando el usuario tipea)
if (inputValorMod)
  inputValorMod.addEventListener("input", calcularPrevisualizacion);

// ==========================================
// SISTEMA DE NOTIFICACIONES TIPO TOAST
// ==========================================
window.mostrarNotificacion = function (mensaje, tipo = "info") {
  let contenedor = document.getElementById("contenedor-toasts");

  // Si no existe el contenedor en el HTML, lo creamos
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "contenedor-toasts";
    contenedor.className = "contenedor-toasts";
    document.body.appendChild(contenedor);
  }

  // Crear la alerta
  const toast = document.createElement("div");
  toast.className = `toast-alerta ${tipo}`;

  // Seleccionar ícono según el tipo (error o info)
  const iconoStr = tipo === "error" ? "alert-triangle" : "info";

  toast.innerHTML = `
    <i data-lucide="${iconoStr}" aria-hidden="true"></i>
    <span>${mensaje}</span>
  `;

  contenedor.appendChild(toast);

  // Refrescar íconos de Lucide en el nuevo elemento
  if (window.lucide) window.lucide.createIcons({ root: toast });

  // Desaparecer automáticamente después de 3 segundos
  setTimeout(() => {
    toast.classList.add("ocultar");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
};

/////////////////////////////////////
// Reloj de caja y atajos de teclado
////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  iniciarRelojCaja();
  configurarAtajosTeclado();
});

// Función para actualizar el reloj de caja
function iniciarRelojCaja() {
  const relojEl = document.getElementById("reloj-vivo");
  if (!relojEl) return;

  const actualizarHora = () => {
    const ahora = new Date();
    relojEl.textContent = ahora.toLocaleTimeString("es-Ar", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  actualizarHora();

  setInterval(actualizarHora, 1000);
}

// Escucha global de atajos de teclado
function configurarAtajosTeclado() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document
        .querySelectorAll(".modal-overlay:not(.modal-oculto)")
        .forEach((modal) => {
          modal.classList.add("modal-oculto");
          modal.setAttribute("aria-hidden", "true");
        });
      return;
    }

    // Suprimir último producto agregado
    if (event.key === "F1") {
      event.preventDefault();
    }

    // Foco rápido en el lector
    if (event.key === "F2") {
      event.preventDefault();
      document.getElementById("input-lector-barras")?.focus();
    }

    // Filtros rápidos de catálogo
    if (event.key === "F3") {
      event.preventDefault();
      document.getElementById("btn-filtro-catalogo")?.click();
    }

    // Consulta rápida de producto
    if (event.key === "F4") {
      event.preventDefault();
      document.getElementById("btn-pausar-recuperar")?.click();
    }

    // Arqueo de caja / Registro de movimientos
    if (event.key === "F5") {
      event.preventDefault();
      document.getElementById("btn-arqueo")?.click();
    }

    // Descuento o recargo
    if (event.key === "F6") {
      event.preventDefault();
      document.getElementById("btn-descuento-global")?.click();
    }

    // Pausar o recuperar venta
    if (event.key === "F8") {
      event.preventDefault();
      document.getElementById("btn-search")?.click();
    }

    // Cobrar venta activa
    if (event.key === "F12") {
      event.preventDefault();
      const btnCobrar = document.getElementById("boton-cobrar");
      if (btnCobrar && !btnCobrar.disabled) {
        btnCobrar.click();
      }
    }
  });
}

// --- VARIABLES PARA CONSULTA RÁPIDA ---
const modalConsulta = document.getElementById("modal-consulta");
const inputConsulta = document.getElementById("input-consulta-codigo");
const tarjetaResultado = document.getElementById("resultado-consulta");
const tarjetaEspera = document.getElementById("espera-consulta");

// Base de datos de prueba (Luego se conectará a /api/articulos)
const dbConsultaPrueba = [
  {
    sku: "779123456",
    nombre: "Yerba Mate Clásica 1kg",
    precio: 3500,
    stock: 15,
  },
  {
    sku: "779987654",
    nombre: "Galletitas Surtidas 400g",
    precio: 1250,
    stock: 2,
  },
];

document.addEventListener("click", (event) => {
  // 9. Abrir Modal Consulta Rápida
  if (event.target.closest('[data-accion="abrir-modal-consulta"]')) {
    modalConsulta.classList.remove("modal-oculto");
    modalConsulta.setAttribute("aria-hidden", "false");

    // Reseteo visual
    inputConsulta.value = "";
    tarjetaResultado.classList.add("oculto");
    tarjetaEspera.style.display = "block";

    setTimeout(() => inputConsulta.focus(), 100);
    return;
  }

  // 10. Cerrar Modal Consulta Rápida
  if (event.target.closest('[data-accion="cerrar-modal-consulta"]')) {
    modalConsulta.classList.add("modal-oculto");
    modalConsulta.setAttribute("aria-hidden", "true");
    return;
  }
});

// ==========================================
// EVENTO DE BÚSQUEDA (Input Enter / Lector Láser)
// ==========================================
if (inputConsulta) {
  inputConsulta.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const codigo = inputConsulta.value.trim();
      if (!codigo) return;

      const producto = dbConsultaPrueba.find((p) => p.sku === codigo);

      if (producto) {
        tarjetaEspera.style.display = "none";
        tarjetaResultado.classList.remove("oculto");

        document.getElementById("res-sku").textContent = producto.sku;
        document.getElementById("res-nombre").textContent = producto.nombre;
        document.getElementById("res-precio").textContent = formatearPrecio(
          producto.precio,
        );

        const elStock = document.getElementById("res-stock");
        elStock.textContent = `Stock: ${producto.stock} un.`;
        elStock.className =
          "resultado-stock " +
          (producto.stock > 5
            ? "stock-ok"
            : producto.stock > 0
              ? "stock-bajo"
              : "stock-cero");
      } else {
        mostrarNotificacion("Producto no encontrado.", "error");
        tarjetaEspera.style.display = "block";
        tarjetaResultado.classList.add("oculto");
      }

      inputConsulta.value = ""; // Limpia para el siguiente
    }
  });
}

// ==========================================
// SIMULACIÓN DE FAVORITOS (MÁS VENDIDOS > 8)
// ==========================================

const articulosFrecuentesMock = [
  {
    id: 101,
    nombre: "Bolsa Camiseta",
    precio: 150.0,
    imagen: "img/producto-bolsa.svg",
  },
  {
    id: 102,
    nombre: "Criollos kg",
    precio: 1800.0,
    imagen: "img/producto-criollos.svg",
  },
  {
    id: 103,
    nombre: "Café al paso",
    precio: 950.0,
    imagen: "img/producto-cafe.svg",
  },
  {
    id: 104,
    nombre: "Agua Caliente Termo",
    precio: 500.0,
    imagen: "img/producto-termo.svg",
  },
];

const renderizarFavoritos = () => {
  const contenedor = document.getElementById("contenedor-favoritos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  articulosFrecuentesMock.forEach((prod) => {
    const html = `
      <article class="card-producto-favorito" data-accion="agregar-al-carrito" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
        <div class="card-imagen">
          <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
        </div>
        <div class="card-info">
          <h3>${prod.nombre}</h3>
          <strong class="precio-destacado">${formatearPrecio(prod.precio)}</strong>
        </div>
        <i data-lucide="star" class="icono-estrella-top" aria-hidden="true"></i>
      </article>
    `;
    contenedor.insertAdjacentHTML("beforeend", html);
  });

  if (window.lucide) window.lucide.createIcons({ root: contenedor });
};

document.addEventListener("DOMContentLoaded", () => {
  renderizarFavoritos();
});

// ==========================================
// LISTENER PARA AGREGAR AL CHANGUITO
// ==========================================
document.addEventListener("click", (event) => {
  const btnAgregar = event.target.closest('[data-accion="agregar-al-carrito"]');

  if (btnAgregar) {
    const idProd = Number(btnAgregar.dataset.id);
    const nombreProd = btnAgregar.dataset.nombre;
    const precioProd = parseFloat(btnAgregar.dataset.precio);

    const itemExistente = carritoActual.find((item) => item.id === idProd);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      carritoActual.push({
        id: idProd,
        nombre: nombreProd,
        precio: precioProd,
        cantidad: 1,
      });
    }

    // Si tenés una función para repintar el changuito visualmente, llamala acá
    // actualizarVistaChanguito();

    if (typeof window.mostrarNotificacion === "function") {
      window.mostrarNotificacion(`${nombreProd} agregado a la venta.`);
    }
  }
});

// ==========================================
// SIMULACIÓN DEL CATÁLOGO COMPLETO
// ==========================================
const articulosCatalogoMock = [
  {
    id: 201,
    nombre: "Yerba Mate Clásica 1kg",
    precio: 3500.0,
    categoria: "Almacen",
  },
  {
    id: 202,
    nombre: "Galletitas Surtidas 400g",
    precio: 1250.0,
    categoria: "Golosinas",
  },
  {
    id: 203,
    nombre: "Cerveza Lata 473ml",
    precio: 1100.0,
    categoria: "Bebidas",
  },
  { id: 204, nombre: "Lavandina 1L", precio: 900.0, categoria: "Limpieza" },
  {
    id: 205,
    nombre: "Queso Dambo 100g",
    precio: 850.0,
    categoria: "Fiambreria",
  },
  {
    id: 206,
    nombre: "Gaseosa Cola 2.25L",
    precio: 2200.0,
    categoria: "Bebidas",
  },
];

const renderizarGrillaPrincipal = () => {
  const contenedor = document.getElementById("catalogo-grilla-principal");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  articulosCatalogoMock.forEach((prod) => {
    // A la tarjeta le pasamos los datos para leerlos cuando abrimos el teclado numérico
    const html = `
      <article class="card-producto" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
        
        <div class="card-img">
          <!-- Si tenés imagen real: <img src="/img/${prod.id}.png" alt="${prod.nombre}"> -->
          <i data-lucide="package" aria-hidden="true"></i>
        </div>
        
        <div class="card-detalles">
          <h3 class="producto-nombre">${prod.nombre}</h3>
          <div class="producto-footer">
            <strong class="producto-precio">${formatearPrecio(prod.precio)}</strong>
            <button type="button" class="btn-cantidad-catalogo" data-accion="abrir-modal-cantidad" aria-label="Cambiar cantidad">
              <span class="cantidad-label">CANT</span>
              <span class="badge-cant">1</span>
            </button>
          </div>
        </div>
      </article>
    `;
    contenedor.insertAdjacentHTML("beforeend", html);
  });

  if (window.lucide) window.lucide.createIcons({ root: contenedor });
};

// Sumá la llamada cuando carga la pantalla
document.addEventListener("DOMContentLoaded", () => {
  renderizarGrillaPrincipal();
});

// --- VARIABLES PARA EL TECLADO NUMÉRICO ---
const modalCantidad = document.getElementById("modal-cantidad");
const inputTecladoCantidad = document.getElementById("input-teclado-cantidad");
let numpadValor = "1";
let prodSeleccionadoNumpad = null;

// ==========================================
// DENTRO DE TU LISTENER GLOBAL DE CLICS
// ==========================================

document.addEventListener("click", (event) => {
  // 1. Abrir Modal de Cantidad (desde las tarjetas del catálogo)
  const btnAbrirNumpad = event.target.closest(
    '[data-accion="abrir-modal-cantidad"]',
  );
  if (btnAbrirNumpad) {
    const card = btnAbrirNumpad.closest(".card-producto");
    if (!card) return;

    prodSeleccionadoNumpad = {
      id: Number(card.dataset.id),
      nombre: card.dataset.nombre,
      precio: parseFloat(card.dataset.precio),
    };

    numpadValor = "1"; // Siempre arranca en 1
    if (inputTecladoCantidad) inputTecladoCantidad.value = numpadValor;

    if (modalCantidad) {
      modalCantidad.classList.remove("modal-oculto");
      modalCantidad.setAttribute("aria-hidden", "false");
    }
    return;
  }

  // 2. Cerrar Modal (desde la X)
  if (event.target.closest('[data-accion="cerrar-modal-cantidad"]')) {
    if (modalCantidad) {
      modalCantidad.classList.add("modal-oculto");
      modalCantidad.setAttribute("aria-hidden", "true");
    }
    return;
  }

  // 3. Manejar pulsaciones dentro del teclado numérico
  if (event.target.classList.contains("tecla")) {
    const tecla = event.target;

    // A) Borrar (C)
    if (tecla.classList.contains("tecla-borrar")) {
      numpadValor = "";
    }
    // B) Confirmar (Aceptar)
    else if (tecla.classList.contains("tecla-aceptar")) {
      if (!prodSeleccionadoNumpad) return;

      const cantidadFinal = parseInt(numpadValor) || 1;

      // Sumar al carrito
      const itemExistente = carritoActual.find(
        (item) => item.id === prodSeleccionadoNumpad.id,
      );
      if (itemExistente) {
        itemExistente.cantidad += cantidadFinal;
      } else {
        carritoActual.push({
          id: prodSeleccionadoNumpad.id,
          nombre: prodSeleccionadoNumpad.nombre,
          precio: prodSeleccionadoNumpad.precio,
          cantidad: cantidadFinal,
        });
      }

      // Cerramos el modal
      if (modalCantidad) {
        modalCantidad.classList.add("modal-oculto");
        modalCantidad.setAttribute("aria-hidden", "true");
      }

      // Notificación de éxito
      if (typeof window.mostrarNotificacion === "function") {
        window.mostrarNotificacion(
          `Se agregaron ${cantidadFinal}x ${prodSeleccionadoNumpad.nombre}`,
        );
      }

      prodSeleccionadoNumpad = null;
    }
    // C) Tipear números
    else {
      const num = tecla.textContent.trim();
      // Si hay un "1" inicial, reemplaza en vez de concatenar (para no formar "15" si tocan "5")
      if (numpadValor === "1" || numpadValor === "0" || numpadValor === "") {
        numpadValor = num;
      } else {
        numpadValor += num;
      }
    }

    // Actualizar el visor
    if (inputTecladoCantidad) {
      inputTecladoCantidad.value = numpadValor || "0";
    }
    return;
  }
});

// ==========================================
// SIMULACIÓN DE VENTAS DEL TURNO
// ==========================================
const ventasTurnoMock = [
  { hora: "19:15", ticket: "#0032", metodo: "Efectivo", total: 1200.0 },
  { hora: "19:02", ticket: "#0031", metodo: "Tarjeta", total: 3450.0 },
  { hora: "18:45", ticket: "#0030", metodo: "Efectivo", total: 850.0 },
  { hora: "18:22", ticket: "#0029", metodo: "Billeteras / QR", total: 2100.0 },
];

const renderizarVentasTurno = (filtro = "Todos") => {
  const tbody = document.getElementById("lista-ventas-turno");
  if (!tbody) return;

  tbody.innerHTML = "";

  const ventasFiltradas =
    filtro === "Todos"
      ? ventasTurnoMock
      : ventasTurnoMock.filter((v) => v.metodo === filtro);

  if (ventasFiltradas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No hay comprobantes para este método.</td></tr>`;
    return;
  }

  ventasFiltradas.forEach((venta) => {
    const html = `
      <tr>
        <td>${venta.hora}</td>
        <td><strong>${venta.ticket}</strong></td>
        <td>${venta.metodo}</td>
        <td><strong>${formatearPrecio(venta.total)}</strong></td>
        <td class="acciones-comprobante">
          <button type="button" class="btn-tabla-accion" data-accion="ver-detalle">Ver Detalle</button>
          <button type="button" class="btn-tabla-accion" data-accion="reimprimir">Reimprimir</button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", html);
  });
};

// Delegación de eventos para los filtros
document.addEventListener("click", (event) => {
  const chipFiltro = event.target.closest("#filtros-metodo-pago .chip");
  if (chipFiltro) {
    // Manejo de clase activa
    document
      .querySelectorAll("#filtros-metodo-pago .chip")
      .forEach((c) => c.classList.remove("active"));
    chipFiltro.classList.add("active");

    // Filtrar tabla
    const criterio = chipFiltro.dataset.filtro;
    renderizarVentasTurno(criterio);
  }
});

// Inicializar la tabla al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  renderizarVentasTurno();
});

// ==========================================
// SIMULACIÓN DE MOVIMIENTOS DE ARQUEO
// ==========================================
const movimientosArqueoMock = [
  {
    hora: "15:42",
    tipo: "Ingreso",
    motivo: "Carga de fondo inicial",
    monto: 50000.0,
    responsable: "Cajero 1",
  },
  {
    hora: "16:15",
    tipo: "Ingreso",
    motivo: "Ingreso de efectivo",
    monto: 5000.0,
    responsable: "Cajero 1",
  },
  {
    hora: "17:30",
    tipo: "Retiro",
    motivo: "Retiro de efectivo para compras",
    monto: 15000.0,
    responsable: "Cajero 1",
  },
];

const renderizarMovimientosArqueo = () => {
  const tbody = document.getElementById("lista-movimientos-turno");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (movimientosArqueoMock.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No hay movimientos registrados.</td></tr>`;
    return;
  }

  movimientosArqueoMock.forEach((mov) => {
    // Determinar la clase de la etiqueta (badge)
    const claseBadge =
      mov.tipo === "Ingreso" ? "badge-ingreso" : "badge-retiro";

    const html = `
      <tr>
        <td>${mov.hora}</td>
        <td><span class="badge-movimiento ${claseBadge}">${mov.tipo}</span></td>
        <td>${mov.motivo}</td>
        <td><strong>${formatearPrecio(mov.monto)}</strong></td>
        <td>${mov.responsable}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", html);
  });
};

// --- VARIABLES PARA EL MODAL DE MOVIMIENTO ---
const modalMovimiento = document.getElementById("modal-registrar-movimiento");
const paso1Mov = document.getElementById("movimiento-paso-1");
const paso2Mov = document.getElementById("movimiento-paso-2");
const btnConfirmarMov = document.getElementById("btn-confirmar-movimiento");

// Elementos dinámicos del formulario
const resumenSeleccion = document.getElementById(
  "resumen-seleccion-movimiento",
);
const labelMonto = document.getElementById("label-monto");
const labelConcepto = document.getElementById("label-concepto");
const grupoMonto = document.getElementById("grupo-monto");
const grupoConcepto = document.getElementById("grupo-concepto");

let pasoActualMovimiento = 1;

document.addEventListener("click", (event) => {
  // 1. Abrir Modal (Resetea al Paso 1)
  if (event.target.closest('[data-accion="abrir-modal-movimiento"]')) {
    pasoActualMovimiento = 1;
    paso1Mov.classList.remove("paso-oculto");
    paso2Mov.classList.add("paso-oculto");
    btnConfirmarMov.classList.add("paso-oculto");

    modalMovimiento.classList.remove("modal-oculto");
    modalMovimiento.setAttribute("aria-hidden", "false");
    return;
  }

  // 2. Avanzar al Paso 2 al clickear una opción
  const btnAvanzar = event.target.closest('[data-accion="avanzar-paso-2"]');
  if (btnAvanzar) {
    const tipo = btnAvanzar.dataset.tipo;

    // Clonar el interior del botón clickeado para el encabezado del Paso 2
    resumenSeleccion.innerHTML = btnAvanzar.innerHTML;

    // Configurar etiquetas y orden según el tipo de movimiento
    grupoMonto.style.order = "1";
    grupoConcepto.style.order = "2";
    document.getElementById("grupo-responsable").style.order = "3";

    if (tipo === "ingreso") {
      labelMonto.textContent = "Monto a ingresar";
      labelConcepto.textContent = "Motivo / Concepto";
    } else if (tipo === "egreso") {
      labelMonto.textContent = "Monto a egresar";
      labelConcepto.textContent = "Motivo / Concepto";
    } else if (tipo === "ajuste") {
      labelMonto.textContent = "Monto del ajuste";
      labelConcepto.textContent = "Motivo / Concepto";
    } else if (tipo === "otro") {
      labelConcepto.textContent = "Concepto";
      labelMonto.textContent = "Monto";
      // En "Otro movimiento", el Concepto va primero
      grupoConcepto.style.order = "1";
      grupoMonto.style.order = "2";
    }

    // Cambiar vistas
    paso1Mov.classList.add("paso-oculto");
    paso2Mov.classList.remove("paso-oculto");
    btnConfirmarMov.classList.remove("paso-oculto");
    pasoActualMovimiento = 2;

    // Foco automático en el monto
    setTimeout(() => document.getElementById("input-monto-mov").focus(), 100);
    return;
  }

  // 3. Botón Cancelar (Volver atrás o cerrar)
  if (
    event.target.closest('[data-accion="volver-o-cerrar-movimiento"]') ||
    event.target.closest('[data-accion="cerrar-modal-movimiento"]')
  ) {
    // Si tocó la X o Cancelar en el paso 1, cerramos el modal
    if (
      pasoActualMovimiento === 1 ||
      event.target.closest('[data-accion="cerrar-modal-movimiento"]')
    ) {
      modalMovimiento.classList.add("modal-oculto");
      modalMovimiento.setAttribute("aria-hidden", "true");
    } else {
      // Si tocó Cancelar en el paso 2, vuelve al paso 1
      paso1Mov.classList.remove("paso-oculto");
      paso2Mov.classList.add("paso-oculto");
      btnConfirmarMov.classList.add("paso-oculto");
      pasoActualMovimiento = 1;
    }
    return;
  }

  // 4. Botón Confirmar
  if (event.target.closest("#btn-confirmar-movimiento")) {
    const monto = document.getElementById("input-monto-mov").value;
    if (!monto || monto <= 0) {
      alert("Por favor, ingresá un monto válido.");
      return;
    }

    console.log("Movimiento registrado por $", monto);
    modalMovimiento.classList.add("modal-oculto");
    document.getElementById("form-registro-mov").reset();
    return;
  }
});

// ==========================================
// HISTORIAL DE VENTAS Y ANTIGÜEDAD
// ==========================================

const historialBaseMock = [
  {
    fecha: "10/11/2026 19:15",
    ticket: "#0032",
    total: 1200.0,
    metodo: "Efectivo",
    estado: "Cobrado",
  },
  {
    fecha: "09/11/2026 14:20",
    ticket: "#0031",
    total: 3450.0,
    metodo: "Tarjeta",
    estado: "Cobrado",
  },
  {
    fecha: "05/11/2026 10:10",
    ticket: "#0030",
    total: 850.0,
    metodo: "Efectivo",
    estado: "Devuelto",
  },
  {
    fecha: "02/11/2026 18:22",
    ticket: "#0029",
    total: 2100.0,
    metodo: "Billeteras / QR",
    estado: "Cobrado",
  },
];

// 1. Calcular antigüedad exacta del cajero
const calcularAntiguedad = (fechaIngresoStr) => {
  const fechaIngreso = new Date(fechaIngresoStr);
  const hoy = new Date();

  let anios = hoy.getFullYear() - fechaIngreso.getFullYear();
  let meses = hoy.getMonth() - fechaIngreso.getMonth();
  let dias = hoy.getDate() - fechaIngreso.getDate();

  if (dias < 0) {
    meses -= 1;
    // Obtener días del mes anterior
    dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }

  const elAntiguedad = document.getElementById("antiguedad-cajero");
  if (elAntiguedad) {
    elAntiguedad.textContent = `${anios} años, ${meses} meses, ${dias} días`;
  }
};

const convertirFechaVenta = (fecha) => {
  const [fechaTexto] = fecha.split(" ");
  const [dia, mes, anio] = fechaTexto.split("/").map(Number);
  return new Date(anio, mes - 1, dia);
};

const obtenerRangoRapido = (filtro) => {
  if (filtro === "todos") {
    return { desde: null, hasta: null };
  }

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (filtro === "ayer") {
    inicio.setDate(inicio.getDate() - 1);
    return { desde: inicio, hasta: new Date(inicio) };
  }

  if (filtro === "semana") {
    const diaSemana = inicio.getDay();
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    inicio.setDate(inicio.getDate() - diasDesdeLunes);
    const hasta = new Date(inicio);
    hasta.setDate(hasta.getDate() + 6);
    return { desde: inicio, hasta };
  }

  return { desde: inicio, hasta: new Date(inicio) };
};

const obtenerFiltrosHistorial = () => {
  const chipActivo = document.querySelector(
    "#filtros-tiempo-historial .chip-historial.activo",
  );
  const desde = document.getElementById("input-fecha-desde").value;
  const hasta = document.getElementById("input-fecha-hasta").value;

  if (desde || hasta) {
    return {
      desde: desde ? new Date(`${desde}T00:00:00`) : null,
      hasta: hasta ? new Date(`${hasta}T00:00:00`) : null,
    };
  }

  return obtenerRangoRapido(chipActivo?.dataset.filtro || "hoy");
};

// Renderizar tabla aplicando búsqueda por ticket y rango de fechas
const renderizarHistorial = (filtro = "") => {
  const tbody = document.getElementById("lista-historial-completo");
  if (!tbody) return;

  tbody.innerHTML = "";

  const { desde, hasta } = obtenerFiltrosHistorial();
  const resultados = historialBaseMock.filter(
    (v) =>
      v.ticket.toLowerCase().includes(filtro.toLowerCase()) &&
      (!desde || convertirFechaVenta(v.fecha) >= desde) &&
      (!hasta || convertirFechaVenta(v.fecha) <= hasta),
  );

  if (resultados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No se encontraron tickets.</td></tr>`;
    return;
  }

  resultados.forEach((venta) => {
    const estaDevuelto = venta.estado === "Devuelto";
    const badgeEstado = estaDevuelto
      ? `<span class="badge-movimiento badge-retiro">Devuelto</span>`
      : `<span class="badge-movimiento badge-ingreso">Cobrado</span>`;

    const html = `
      <tr>
        <td>${venta.fecha}</td>
        <td><strong>${venta.ticket}</strong></td>
        <td><strong>$ ${venta.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></td>
        <td>${venta.metodo}</td>
        <td>${badgeEstado}</td>
        <td class="acciones-comprobante">
          <button type="button" class="btn-tabla-accion btn-accion-reimprimir" data-accion="reimprimir-ticket">
            Reimprimir
          </button>
          <button type="button" class="btn-tabla-accion btn-accion-cambio" data-accion="abrir-modal-historial" ${estaDevuelto ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ""}>
            Acciones
          </button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", html);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // Simular fecha de ingreso del cajero (ej: 14 de marzo de 2023)
  calcularAntiguedad("2023-03-14T08:00:00");
  renderizarHistorial();

  // Escuchar tipeo en el buscador
  const buscador = document.getElementById("buscador-historial-ticket");
  if (buscador) {
    buscador.addEventListener("input", (e) => {
      renderizarHistorial(e.target.value.trim());
    });
  }
});

// (Variables a declarar al inicio de tu JS)
const modalHistorial = document.getElementById("modal-historial-movimiento");
const labelMontoHistorial = document.getElementById("label-monto-historial");
const inputMontoHistorial = document.getElementById("input-monto-historial");

// ==========================================
// DENTRO DE TU LISTENER GLOBAL DE CLICS
// ==========================================

document.addEventListener("click", (event) => {
  // 1. Abrir Modal Historial (Reintegro)
  if (event.target.closest('[data-accion="abrir-modal-historial"]')) {
    if (modalHistorial) {
      // Reseteo visual
      document
        .querySelectorAll("#modal-historial-movimiento .tab-btn")
        .forEach((btn) => btn.classList.remove("activo"));
      document
        .querySelector(
          '#modal-historial-movimiento .tab-btn[data-tipo="reintegro"]',
        )
        ?.classList.add("activo");
      labelMontoHistorial.textContent = "Monto a reintegrar";
      inputMontoHistorial.value = "";
      document.getElementById("select-motivo-historial").value = "";
      document.getElementById("input-obs-historial").value = "";

      modalHistorial.classList.remove("modal-oculto");
      modalHistorial.setAttribute("aria-hidden", "false");
      setTimeout(() => inputMontoHistorial.focus(), 100);
    }
    return;
  }

  // 2. Cerrar Modal Historial
  if (event.target.closest('[data-accion="cerrar-modal-historial"]')) {
    if (modalHistorial) {
      modalHistorial.classList.add("modal-oculto");
      modalHistorial.setAttribute("aria-hidden", "true");
    }
    return;
  }

  // 3. Cambiar Pestañas (Reintegro / Devolución)
  const btnTabHistorial = event.target.closest(
    '[data-accion="set-tipo-historial"]',
  );
  if (btnTabHistorial) {
    // Cambiar estado visual de las pestañas
    document
      .querySelectorAll("#modal-historial-movimiento .tab-btn")
      .forEach((b) => b.classList.remove("activo"));
    btnTabHistorial.classList.add("activo");

    const tipo = btnTabHistorial.dataset.tipo; // "reintegro" o "devolucion"
    const selectMotivo = document.getElementById("select-motivo-historial");

    // Cambiar etiqueta y opciones dinámicamente
    if (tipo === "devolucion") {
      labelMontoHistorial.textContent = "Monto a devolver";
      selectMotivo.innerHTML = opcionesDevolucion;
    } else {
      labelMontoHistorial.textContent = "Monto a reintegrar";
      selectMotivo.innerHTML = opcionesCambioReintegro;
    }

    return;
  }

  // 4. Confirmar Movimiento
  if (event.target.closest('[data-accion="confirmar-historial"]')) {
    const monto = inputMontoHistorial.value;
    const motivo = document.getElementById("select-motivo-historial").value;
    const tabActiva = document.querySelector(
      "#modal-historial-movimiento .tab-btn.activo",
    );

    if (!tabActiva || !monto || Number(monto) <= 0) {
      alert("Ingresá un monto válido.");
      return;
    }

    const tipo = tabActiva.dataset.tipo;

    // Acá enviás los datos al backend (tipo, monto, motivo)
    console.log(
      `Registrando ${tipo}: $${monto} | Motivo: ${motivo || "Ninguno"}`,
    );

    modalHistorial.classList.add("modal-oculto");
  }
});

const opcionesCambioReintegro = `
    <option value="" disabled selected>Seleccioná un motivo</option>
    <option value="cambio_talle">Cambio de talle</option>
    <option value="cambio_modelo">Cambio de modelo / color</option>
    <option value="otro">Otro</option>
  `;

const opcionesDevolucion = `
    <option value="" disabled selected>Seleccioná un motivo</option>
    <option value="falla">Falla de fábrica</option>
    <option value="cambio_opinion">Cambio de opinión</option>
    <option value="otro">Otro</option>
  `;

// Delegación de eventos para los chips de filtro por tiempo
document.addEventListener("click", (event) => {
  const chipHistorial = event.target.closest(
    "#filtros-tiempo-historial .chip-historial",
  );
  if (!chipHistorial) return;

  document
    .querySelectorAll("#filtros-tiempo-historial .chip-historial")
    .forEach((c) => c.classList.remove("activo"));
  chipHistorial.classList.add("activo");

  // Limpiar las fechas seleccionadas si se elige un chip rápido
  document.getElementById("texto-fecha-desde").textContent = "Desde";
  document.getElementById("texto-fecha-hasta").textContent = "Hasta";
  document.getElementById("input-fecha-desde").value = "";
  document.getElementById("input-fecha-hasta").value = "";
  const buscador = document.getElementById("buscador-historial-ticket");
  renderizarHistorial(buscador?.value.trim() || "");
});

// 2. Formatear la fecha elegida (Va por fuera del listener de clics, directo en el DOMContentLoaded)
const formatearFechaElegida = (inputId, textoId, placeholder) => {
  const input = document.getElementById(inputId);
  const texto = document.getElementById(textoId);

  if (input) {
    const botonFecha = input.closest(".btn-fecha-historial");
    if (botonFecha) {
      botonFecha.addEventListener("click", (event) => {
        if (typeof input.showPicker !== "function") return;

        event.preventDefault();
        input.focus();
        input.showPicker();
      });
    }

    input.addEventListener("change", (e) => {
      const fecha = e.target.value;
      if (fecha) {
        // Formatea de AAAA-MM-DD a DD/MM
        const [, mes, dia] = fecha.split("-");
        texto.textContent = `${dia}/${mes}`;
        texto.style.color = "#161615";

        // Desactivar chips porque estamos usando búsqueda manual
        document
          .querySelectorAll("#filtros-tiempo-historial .chip-historial")
          .forEach((c) => c.classList.remove("activo"));
      } else {
        texto.textContent = placeholder;
        texto.style.color = "";
      }

      const buscador = document.getElementById("buscador-historial-ticket");
      renderizarHistorial(buscador?.value.trim() || "");
    });
  }
};

formatearFechaElegida("input-fecha-desde", "texto-fecha-desde", "Desde");
formatearFechaElegida("input-fecha-hasta", "texto-fecha-hasta", "Hasta");

const modalCierre = document.getElementById("modal-cierre");
const inputEfectivoCierre = document.getElementById("input-efectivo-cierre");
const txtDiferenciaCierre = document.getElementById("txt-diferencia-cierre");

// Total simulado proveniente del backend o cálculos del turno
const totalEsperadoCierre = 12450.0;

// Escuchador dinámico para calcular la diferencia al tipear
if (inputEfectivoCierre && txtDiferenciaCierre) {
  inputEfectivoCierre.addEventListener("input", (e) => {
    const contado = parseFloat(e.target.value) || 0;
    const diferencia = contado - totalEsperadoCierre;

    const formatoMoneda = Math.abs(diferencia).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (diferencia < 0) {
      txtDiferenciaCierre.textContent = `- $ ${formatoMoneda}`;
      txtDiferenciaCierre.className = "diferencia-valor texto-peligro"; // Se pinta rojo
    } else {
      txtDiferenciaCierre.textContent = `$ ${formatoMoneda}`;
      txtDiferenciaCierre.className = "diferencia-valor texto-ok"; // Se pinta verde flúor
    }
  });
}

document.addEventListener("click", (event) => {
  // Abrir Modal Cierre
  if (event.target.closest('[data-accion="abrir-modal-cierre"]')) {
    if (modalCierre) {
      // Resetear valores al abrir
      if (inputEfectivoCierre) inputEfectivoCierre.value = "";
      if (txtDiferenciaCierre) {
        txtDiferenciaCierre.textContent = "$ 0,00";
        txtDiferenciaCierre.className = "diferencia-valor texto-ok";
      }

      modalCierre.classList.remove("modal-oculto");
      modalCierre.setAttribute("aria-hidden", "false");
      setTimeout(() => inputEfectivoCierre?.focus(), 100);
    }
    return;
  }

  // Cerrar Modal Cierre
  if (event.target.closest('[data-accion="cerrar-modal-cierre"]')) {
    if (modalCierre) {
      modalCierre.classList.add("modal-oculto");
      modalCierre.setAttribute("aria-hidden", "true");
    }
    return;
  }

  // Confirmar Cierre
  if (event.target.closest('[data-accion="confirmar-cierre"]')) {
    const contado = parseFloat(inputEfectivoCierre.value) || 0;
    const dif = contado - totalEsperadoCierre;

    console.log(
      `Ejecutando cierre de caja: Contado $${contado} | Diferencia $${dif}`,
    );

    if (modalCierre) modalCierre.classList.add("modal-oculto");
    alert("Caja cerrada exitosamente.");
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modalApertura = document.getElementById("modal-inicio-turno");
  const inputsBilletes = document.querySelectorAll(".input-billete");
  const textoTotalApertura = document.getElementById("total-apertura");

  // 1. Cálculo dinámico del total de billetes
  const calcularTotalFondo = () => {
    let total = 0;
    inputsBilletes.forEach((input) => {
      const cantidad = parseInt(input.value) || 0;
      const denominacion = parseInt(input.dataset.denominacion) || 0;
      total += cantidad * denominacion;
    });

    // Formatear el total y mostrarlo
    if (textoTotalApertura) {
      textoTotalApertura.textContent = `$ ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    }
  };

  // Asignar el evento input a todos los campos de billetes
  inputsBilletes.forEach((input) => {
    input.addEventListener("input", calcularTotalFondo);
  });

  // 2. Listener global para apertura y cierre (usando delegación)
  document.addEventListener("click", (event) => {
    // Abrir (Acá podés cambiar el data-accion o abrirlo automático si no hay sesión)
    if (event.target.closest('[data-accion="abrir-modal-apertura"]')) {
      if (modalApertura) {
        modalApertura.classList.remove("modal-oculto");
        modalApertura.setAttribute("aria-hidden", "false");
        // Reset de campos
        inputsBilletes.forEach((i) => (i.value = ""));
        calcularTotalFondo();
      }
      return;
    }

    // Cancelar/Cerrar
    if (event.target.closest('[data-accion="cerrar-modal-apertura"]')) {
      if (modalApertura) {
        modalApertura.classList.add("modal-oculto");
        modalApertura.setAttribute("aria-hidden", "true");
      }
      return;
    }

    // Aceptar
    if (event.target.closest("#btn-confirmar-apertura")) {
      const responsable = document.getElementById(
        "input-nombre-responsable",
      ).value;
      const totalStr = textoTotalApertura.textContent;

      console.log(
        `Turno iniciado. Responsable: ${responsable} | Fondo Inicial: ${totalStr}`,
      );

      if (modalApertura) {
        modalApertura.classList.add("modal-oculto");
        modalApertura.setAttribute("aria-hidden", "true");
      }

      // Acá podrías refrescar la interfaz (ej: hora de apertura, nombre del cajero)
      alert(`Turno abierto correctamente con ${totalStr}`);
      return;
    }
  });
});

// --- VARIABLES PARA APERTURA DE TURNO ---
const modalApertura = document.getElementById("modal-inicio-turno");
const inputsBilletes = document.querySelectorAll(".input-billete");
const textoTotalApertura = document.getElementById("total-apertura");

// Simulador de estado de sesión (Debería venir de tu backend: "abierta" o "cerrada")
let turnoIniciado = false;

// Función para calcular la suma de billetes en tiempo real
const calcularTotalBilletes = () => {
  let total = 0;
  inputsBilletes.forEach((input) => {
    const cantidad = parseInt(input.value) || 0;
    const denominacion = parseInt(input.dataset.denominacion) || 0;
    total += cantidad * denominacion;
  });

  if (textoTotalApertura) {
    textoTotalApertura.textContent = `$ ${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Asignar el cálculo en tiempo real a cada input de la grilla de billetes
inputsBilletes.forEach((input) => {
  input.addEventListener("input", calcularTotalBilletes);
});

// ==========================================
// APERTURA AUTOMÁTICA AL CARGAR LA PÁGINA
// ==========================================
if (!turnoIniciado && modalApertura) {
  // Retrasamos unos milisegundos para asegurar que el DOM pintó todo el layout base
  setTimeout(() => {
    modalApertura.classList.remove("modal-oculto");
    modalApertura.setAttribute("aria-hidden", "false");
    inputsBilletes.forEach((i) => (i.value = ""));
    calcularTotalBilletes();
  }, 150);
}

document.addEventListener("click", (event) => {
  // Botón Aceptar (Confirmar inicio de turno)
  if (event.target.closest("#btn-confirmar-apertura")) {
    const responsableNombre = document.getElementById(
      "input-nombre-responsable",
    ).value;
    const idPerfil = document.getElementById("select-id-responsable").value;

    console.log(
      `Abriendo turno para ${responsableNombre} (${idPerfil}) con fondo inicial de ${textoTotalApertura.textContent}`,
    );

    turnoIniciado = true;
    if (modalApertura) {
      modalApertura.classList.add("modal-oculto");
      modalApertura.setAttribute("aria-hidden", "true");
    }

    // Actualizar cabecera de la UI con los datos ingresados
    const elNombreRol = document.getElementById("nombre-rol");
    const elHoraApertura = document.getElementById("hora-apertura");

    if (elNombreRol) elNombreRol.textContent = responsableNombre;

    if (elHoraApertura) {
      const horaActual = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      elHoraApertura.textContent = `${horaActual} hs`;
    }

    return;
  }

  // Botón Cancelar (Redirigir al login si se arrepiente)
  if (event.target.closest("#btn-cancelar-apertura")) {
    window.location.href = "/login.html";
  }
});
