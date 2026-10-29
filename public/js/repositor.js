// Mock de productos
const inventarioMock = [
  {
    id: "P001",
    nombre: "Coca Cola 2L",
    categoria: "Bebidas",
    descripcion: "Gaseosa cola retornable",
    precio: 2500,
    stock: 24,
  },
  {
    id: "P002",
    nombre: "Alfajor Fantoche",
    categoria: "Golosinas",
    descripcion: "Alfajor triple de chocolate",
    precio: 800,
    stock: 0,
  },
  {
    id: "P003",
    nombre: "Yerba Playadito 1kg",
    categoria: "Almacén",
    descripcion: "Yerba mate suave con palo",
    precio: 4200,
    stock: 15,
  },
  {
    id: "P004",
    nombre: "Galletitas Oreo",
    categoria: "Almacén",
    descripcion: "Galletitas de chocolate rellenas",
    precio: 1200,
    stock: 42,
  },
  {
    id: "P005",
    nombre: "Agua Villavicencio",
    categoria: "Bebidas",
    descripcion: "Agua mineral sin gas 1.5L",
    precio: 900,
    stock: 5,
  },
  {
    id: "P006",
    nombre: "Fideos Matarazzo",
    categoria: "Almacén",
    descripcion: "Fideos mostacholes 500g",
    precio: 1100,
    stock: 12,
  },
  {
    id: "P007",
    nombre: "Gomitas Mogul",
    categoria: "Golosinas",
    descripcion: "Gomitas de gelatina frutales",
    precio: 400,
    stock: 0,
  },
  {
    id: "P008",
    nombre: "Cerveza Quilmes",
    categoria: "Bebidas",
    descripcion: "Cerveza rubia clásica 1L",
    precio: 1800,
    stock: 30,
  },
  {
    id: "P009",
    nombre: "Alfajor Havanna 70% Cacao",
    categoria: "Golosinas",
    descripcion:
      "Alfajor relleno de dulce de leche cubierto con chocolate semiamargo 70% cacao.",
    precio: 1800,
    stock: 3,
  },
  {
    id: "P010",
    nombre: "Hamburguesas NotCo NotBurger",
    categoria: "Congelados",
    descripcion:
      "Medallones a base de plantas (plant-based). Pack por 2 unidades.",
    precio: 3500,
    stock: 8,
  },
  {
    id: "P011",
    nombre: "Yerba Mate Playadito 500g",
    categoria: "Almacén",
    descripcion: "Yerba mate tradicional con palo, libre de gluten (sin TACC).",
    precio: 2200,
    stock: 24,
  },
  {
    id: "P012",
    nombre: "Coca-Cola Sabor Original 2.25L",
    categoria: "Bebidas",
    descripcion: "Gaseosa cola sabor original, envase retornable.",
    precio: 2100,
    stock: 4,
  },
  {
    id: "P013",
    nombre: "Leche Entera La Serenísima 1L",
    categoria: "Lácteos",
    descripcion: "Leche entera larga vida en sachet. 3% tenor graso.",
    precio: 1300,
    stock: 15,
  },
  {
    id: "P014",
    nombre: "Pan Lactal Bimbo Blanco",
    categoria: "Panadería",
    descripcion: "Pan de molde blanco tradicional, tamaño familiar 400g.",
    precio: 1950,
    stock: 0,
  },
  {
    id: "P015",
    nombre: "Cerveza Patagonia Amber Lager 730ml",
    categoria: "Bebidas",
    descripcion: "Cerveza roja con sutil sabor a caramelo, envase de vidrio.",
    precio: 2600,
    stock: 9,
  },
  {
    id: "P016",
    nombre: "Papas Fritas Lay's Clásicas 145g",
    categoria: "Snacks",
    descripcion: "Papas fritas con sal, corte tradicional.",
    precio: 1650,
    stock: 12,
  },
  {
    id: "P017",
    nombre: "Jabón Líquido Skip Para Diluir 500ml",
    categoria: "Limpieza",
    descripcion: "Jabón líquido para ropa, rinde 3 litros una vez diluido.",
    precio: 4200,
    stock: 2,
  },
  {
    id: "P018",
    nombre: "Galletitas Oreo 117g",
    categoria: "Golosinas",
    descripcion: "Galletitas de chocolate rellenas con crema sabor vainilla.",
    precio: 950,
    stock: 7,
  },
  {
    id: "P019",
    nombre: "Queso Crema Casancrem Clásico 300g",
    categoria: "Lácteos",
    descripcion: "Queso blanco untable clásico.",
    precio: 2300,
    stock: 18,
  },
  {
    id: "P020",
    nombre: "Fideos Tirabuzón Matarazzo 500g",
    categoria: "Almacén",
    descripcion: "Fideos secos de sémola de trigo candeal, tipo fusilli.",
    precio: 1100,
    stock: 35,
  },
  {
    id: "P021",
    nombre: "Puré de Tomate Arcor 520g",
    categoria: "Almacén",
    descripcion: "Puré de tomate en envase tetra brik.",
    precio: 780,
    stock: 5,
  },
  {
    id: "P022",
    nombre: "Turrón de Maní Arcor 25g",
    categoria: "Golosinas",
    descripcion: "Turrón clásico con maní. Display por unidad.",
    precio: 250,
    stock: 6,
  },
  {
    id: "P023",
    nombre: "Rollo de Cocina Sussex Clásico",
    categoria: "Limpieza",
    descripcion: "Paquete de 3 rollos de papel de cocina de 50 paños cada uno.",
    precio: 1800,
    stock: 11,
  },
];

// array filtros
let productosFiltrados = [...inventarioMock];

// Variables paginacion
let paginaActual = 1;
const itemsPorPagina = 12;
//Variables ordenamiento
let columnaOrdenActual = null;
let ordenAscendente = true;

// Renderizar los productos en tabla con paginado
function renderizarInventario() {
  const tbody = document.getElementById("tabla-base-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Matemática del paginado
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);

  productosPagina.forEach((producto) => {
    const fila = document.createElement("tr");

    // Lógica del Semáforo 
    let claseStock = "stock-normal"; // Por defecto no tiene fondo
    if (producto.stock <= 5) {
      claseStock = "stock-critico";
    } else if (producto.stock <= 10) {
      claseStock = "stock-advertencia";
    }

    fila.innerHTML = `
      <td>${producto.id}</td>
      <td><strong>${producto.nombre}</strong></td>
      <td>${producto.categoria}</td>
      <td class="truncar-texto">${producto.descripcion}</td>
      <td>$${producto.precio}</td>
      <td>
        <span class="badge-stock ${claseStock}">${producto.stock}</span>
      </td>
      <td>
        <button class="btn-primario" data-id="${producto.id}" data-nombre="${producto.nombre}" data-descripcion="${producto.descripcion}" data-stock="${producto.stock}">
          Actualizar
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
  actualizarControlesPaginacion();
}

// Generar los controles de paginación
function actualizarControlesPaginacion() {
  const contenedorNumeros = document.getElementById("numeros-paginacion");
  const btnAnterior = document.getElementById("btn-anterior");
  const btnSiguiente = document.getElementById("btn-siguiente");

  if (!contenedorNumeros) return;

  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);

  if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
  if (btnSiguiente) btnSiguiente.disabled = paginaActual === totalPaginas;

  contenedorNumeros.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btnNumero = document.createElement("button");
    btnNumero.className = `btn-fantasma ${i === paginaActual ? "active" : ""}`;
    btnNumero.textContent = i;

    btnNumero.addEventListener("click", () => {
      paginaActual = i;
      renderizarInventario();
    });

    contenedorNumeros.appendChild(btnNumero);
  }
}

// Inicialización y Eventos (DOM Cargado)
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  renderizarInventario();

  const cabecerasOrdenables = document.querySelectorAll(".sortable");

  // Lógica Ordenar por ... 
  cabecerasOrdenables.forEach((cabecera) => {
    cabecera.addEventListener("click", () => {
      const columna = cabecera.getAttribute("data-sort");

      if (columnaOrdenActual === columna) {
        ordenAscendente = !ordenAscendente;
      } else {
        columnaOrdenActual = columna;
        ordenAscendente = true;
      }

      productosFiltrados.sort((a, b) => {
        let valorA = a[columna];
        let valorB = b[columna];

        if (typeof valorA === "string") valorA = valorA.toLowerCase();
        if (typeof valorB === "string") valorB = valorB.toLowerCase();

        if (valorA < valorB) return ordenAscendente ? -1 : 1;
        if (valorA > valorB) return ordenAscendente ? 1 : -1;
        return 0;
      });
      
      paginaActual = 1;
      renderizarInventario();
    });
  }); 

  // ---  Lógica de Filtros ---
  const inputBuscador = document.getElementById("buscar-producto");
  const selectSemaforo = document.getElementById("select-semaforo");

  function aplicarFiltros() {
    const termino = inputBuscador.value.toLowerCase();
    const estadoStock = selectSemaforo.value;

    productosFiltrados = inventarioMock.filter((producto) => {
      const coincideTexto =
        producto.nombre.toLowerCase().includes(termino) ||
        producto.id.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino) ||
        producto.precio.toString().includes(termino);

      let coincideSemaforo = true;
      if (estadoStock === "critico") {
        coincideSemaforo = producto.stock <= 5;
      } else if (estadoStock === "advertencia") {
        coincideSemaforo = producto.stock > 5 && producto.stock <= 10;
      } else if (estadoStock === "normal") {
        coincideSemaforo = producto.stock > 10;
      }

      return coincideTexto && coincideSemaforo;
    });

    paginaActual = 1;
    renderizarInventario();
  }

  if (inputBuscador) inputBuscador.addEventListener("input", aplicarFiltros);
  if (selectSemaforo) selectSemaforo.addEventListener("change", aplicarFiltros);

  const btnAnterior = document.getElementById("btn-anterior");
  const btnSiguiente = document.getElementById("btn-siguiente");

  if (btnAnterior && btnSiguiente) {
    btnAnterior.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual--;
        renderizarInventario();
      }
    });

    btnSiguiente.addEventListener("click", () => {
      const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
      if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarInventario();
      }
    });
  }

  // --- Lógica de las pestañas ---
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

  // Lógica del Modal 
  const modalStock = document.getElementById("modal-stock");
  const btnCerrarModal = document.getElementById("cerrar-modal");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");
  const formStock = document.getElementById("form-stock");
  const spanNombreProducto = document.getElementById("modal-nombre-producto");
  const inputNuevoStock = document.getElementById("nuevo-stock");
  const inputNuevaDescripcion = document.getElementById("nueva-descripcion");
  const imgPreview = document.getElementById("modal-preview-foto");
  const inputNuevaFoto = document.getElementById("nueva-foto");

  // Abrir modal
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-primario")) {
      const id = e.target.getAttribute("data-id");
      const nombre = e.target.getAttribute("data-nombre");
      const stockActual = e.target.getAttribute("data-stock");
      const descripcionActual = e.target.getAttribute("data-descripcion");

      const fotoActual =
        e.target.getAttribute("data-foto") ||
        "https://via.placeholder.com/150?text=Sin+Foto";

      spanNombreProducto.textContent = nombre;
      inputNuevoStock.value = stockActual;
      inputNuevaDescripcion.value = descripcionActual;
      imgPreview.src = fotoActual;
      inputNuevaFoto.value = "";

      formStock.setAttribute("data-producto-id", id);
      modalStock.showModal();
    }
  });

  inputNuevaFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      imgPreview.src = objectUrl;
    }
  });

  // Funciones para cerrar
  const cerrarModal = () => modalStock.close();
  btnCerrarModal.addEventListener("click", cerrarModal);
  btnCancelarModal.addEventListener("click", cerrarModal);

  // Enviar modal
  formStock.addEventListener("submit", (e) => {
    e.preventDefault();
    const idProducto = formStock.getAttribute("data-producto-id");
    const nuevoStock = parseInt(inputNuevoStock.value, 10);
    const nuevaDescripcion = inputNuevaDescripcion.value;
    const archivoFoto = inputNuevaFoto.files[0];

    const productoIndex = inventarioMock.findIndex((p) => p.id === idProducto);

    if (productoIndex !== -1) {
      inventarioMock[productoIndex].stock = nuevoStock;
      inventarioMock[productoIndex].descripcion = nuevaDescripcion;
      if (archivoFoto) {
        inventarioMock[productoIndex].foto = URL.createObjectURL(archivoFoto);
      }

      aplicarFiltros();
    }

    modalStock.close();
  });
});
