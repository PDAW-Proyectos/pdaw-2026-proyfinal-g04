// 1. Mock de productos
const inventarioMock = [
  { id: "P001", nombre: "Coca Cola 2L", categoria: "Bebidas", descripcion: "Gaseosa cola retornable", precio: 2500, stock: 24 },
  { id: "P002", nombre: "Alfajor Fantoche", categoria: "Golosinas", descripcion: "Alfajor triple de chocolate", precio: 800, stock: 0 },
  { id: "P003", nombre: "Yerba Playadito 1kg", categoria: "Almacén", descripcion: "Yerba mate suave con palo", precio: 4200, stock: 15 },
  { id: "P004", nombre: "Galletitas Oreo", categoria: "Almacén", descripcion: "Galletitas de chocolate rellenas", precio: 1200, stock: 42 },
  { id: "P005", nombre: "Agua Villavicencio", categoria: "Bebidas", descripcion: "Agua mineral sin gas 1.5L", precio: 900, stock: 5 },
  { id: "P006", nombre: "Fideos Matarazzo", categoria: "Almacén", descripcion: "Fideos mostacholes 500g", precio: 1100, stock: 12 },
  { id: "P007", nombre: "Gomitas Mogul", categoria: "Golosinas", descripcion: "Gomitas de gelatina frutales", precio: 400, stock: 0 },
  { id: "P008", nombre: "Cerveza Quilmes", categoria: "Bebidas", descripcion: "Cerveza rubia clásica 1L", precio: 1800, stock: 30 }
];

// Variables paginacion
let paginaActual = 1;
const itemsPorPagina = 8;

// 2. Renderizar los productos en tabla (con paginado)
function renderizarInventario() {
  const tbody = document.getElementById("tabla-inventario-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Matemática del paginado
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const productosPagina = inventarioMock.slice(inicio, fin);

  productosPagina.forEach((producto) => {
    const fila = document.createElement("tr");
    const alertaStock = producto.stock === 0 ? 'class="stock-critico"' : "";

    // Agregamos class="truncar-texto" en la descripción para que no rompa las tarjetas
    fila.innerHTML = `
      <td>${producto.id}</td>
      <td><strong>${producto.nombre}</strong></td>
      <td>${producto.categoria}</td>
      <td class="truncar-texto">${producto.descripcion}</td>
      <td>$${producto.precio}</td>
      <td ${alertaStock}>${producto.stock}</td>
      <td>
        <button class="btn-actualizar" data-id="${producto.id}" data-nombre="${producto.nombre}" data-stock="${producto.stock}">
          Actualizar
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  actualizarControlesPaginacion();
}

// 3. Generar los controles de paginación
function actualizarControlesPaginacion() {
  const contenedorNumeros = document.getElementById('numeros-paginacion');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnSiguiente = document.getElementById('btn-siguiente');
  
  if (!contenedorNumeros) return;

  const totalPaginas = Math.ceil(inventarioMock.length / itemsPorPagina);

  if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
  if (btnSiguiente) btnSiguiente.disabled = paginaActual === totalPaginas;

  contenedorNumeros.innerHTML = '';
  
  for (let i = 1; i <= totalPaginas; i++) {
    const btnNumero = document.createElement('button');
    btnNumero.className = `numero-pagina ${i === paginaActual ? 'active' : ''}`;
    btnNumero.textContent = i;
    
    btnNumero.addEventListener('click', () => {
      paginaActual = i;
      renderizarInventario();
    });

    contenedorNumeros.appendChild(btnNumero);
  }
}

// 4. Inicialización y Eventos (DOM Cargado)
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  renderizarInventario();

  const btnAnterior = document.getElementById('btn-anterior');
  const btnSiguiente = document.getElementById('btn-siguiente');

  if (btnAnterior && btnSiguiente) {
    btnAnterior.addEventListener('click', () => {
      if (paginaActual > 1) {
        paginaActual--;
        renderizarInventario();
      }
    });

    btnSiguiente.addEventListener('click', () => {
      const totalPaginas = Math.ceil(inventarioMock.length / itemsPorPagina);
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

  // --- Lógica del Modal de Stock y Foto ---
  const modalStock = document.getElementById("modal-stock");
  const btnCerrarModal = document.getElementById("cerrar-modal");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");
  const formStock = document.getElementById("form-stock");
  
  const spanNombreProducto = document.getElementById("modal-nombre-producto");
  const inputNuevoStock = document.getElementById("nuevo-stock");
  
  // Elementos de la foto
  const imgPreview = document.getElementById("modal-preview-foto");
  const inputNuevaFoto = document.getElementById("nueva-foto");

  // Abrir modal
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-actualizar")) {
      const id = e.target.getAttribute("data-id");
      const nombre = e.target.getAttribute("data-nombre");
      const stockActual = e.target.getAttribute("data-stock");
      
      const fotoActual = e.target.getAttribute("data-foto") || "https://via.placeholder.com/150?text=Sin+Foto";

      spanNombreProducto.textContent = nombre;
      inputNuevoStock.value = stockActual;
      imgPreview.src = fotoActual;
      inputNuevaFoto.value = ""; 
      
      formStock.setAttribute("data-producto-id", id);
      modalStock.showModal();
    }
  });

  inputNuevaFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Creamos una URL temporal para mostrar la imagen seleccionada en el acto
      const objectUrl = URL.createObjectURL(file);
      imgPreview.src = objectUrl;
    }
  });

  // Funciones para cerrar
  const cerrarModal = () => modalStock.close();
  btnCerrarModal.addEventListener("click", cerrarModal);
  btnCancelarModal.addEventListener("click", cerrarModal);

  //Enviar modal
  formStock.addEventListener("submit", (e) => {
    e.preventDefault();
    const idProducto = formStock.getAttribute("data-producto-id");
    const nuevoStock = parseInt(inputNuevoStock.value, 10); 
    const archivoFoto = inputNuevaFoto.files[0];

    const productoIndex = inventarioMock.findIndex(p => p.id === idProducto);

    if (productoIndex !== -1) {
      inventarioMock[productoIndex].stock = nuevoStock;

      if (archivoFoto) {
        inventarioMock[productoIndex].foto = URL.createObjectURL(archivoFoto);
      }

      renderizarInventario(); 
    }

    console.log(`Simulando envío a la API: Producto ${idProducto}, Nuevo Stock: ${nuevoStock}`);
    modalStock.close();
  });
});