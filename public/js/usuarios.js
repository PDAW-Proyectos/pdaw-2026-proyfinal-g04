import { mostrarToast } from "./admin.js";

document.addEventListener("DOMContentLoaded", () => {
  let usuariosBase = [];
  let usuariosFiltrados = [];
  let paginaActualUsuarios = 1;
  const itemsPorPaginaUsuarios = 10;
  let columnaOrdenUsuarios = null;
  let ordenAscendenteUsuarios = true;

  const tbodyUsuarios = document.getElementById("tabla-body-usuarios");

  //Obtener datos desde el backend
  async function cargarUsuarios() {
    try {
      const respuesta = await fetch("/api/usuarios");
      if (!respuesta.ok) throw new Error("Error al traer usuarios");

      const datos = await respuesta.json();

      usuariosBase = datos.usuarios || datos;
      usuariosFiltrados = [...usuariosBase];

      renderizarTablaUsuarios();
      actualizarDashboardUsuarios();
    } catch (error) {
      console.error(error);
      if (typeof mostrarToast === "function")
        mostrarToast("No se pudieron cargar los usuarios", true);
    }
  }

  //Tabla

  function renderizarTablaUsuarios() {
    if (!tbodyUsuarios) return;

    //Matemática del paginado
    const totalPaginas =
      Math.ceil(usuariosFiltrados.length / itemsPorPaginaUsuarios) || 1;
    if (paginaActualUsuarios > totalPaginas)
      paginaActualUsuarios = totalPaginas;

    const inicio = (paginaActualUsuarios - 1) * itemsPorPaginaUsuarios;
    const fin = inicio + itemsPorPaginaUsuarios;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    tbodyUsuarios.innerHTML = "";

    // Dibujar filas
    usuariosPagina.forEach((user) => {
      let claseBadge = "neutro";
      let claseEstado = "badge-verde";
      let textoEstado = "Activo";

      if (user.habilitado === false) {
        claseEstado = "rojo";
        textoEstado = "Inactivo";
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.id}</td>
        <td><strong>${user.nombre}</strong></td>
        <td>${user.email}</td>
        <td><span class="badge ${claseBadge}">${user.rol}</span></td>
        <td>
          <span class="badge ${claseEstado}">${textoEstado}</span>
        </td>
        <td>
          <button class="btn-editar-usuario btn-primario btn-chico" data-id="${user.id}" title="Editar" style="padding: 6px;">
            <i data-lucide="settings" class="icono-chico"></i>
          </button>
        </td>
      `;
      tbodyUsuarios.appendChild(tr);
    });

    actualizarControlesPaginacionUsuarios();
    if (typeof lucide !== "undefined") lucide.createIcons();
    asignarEventosBotonesTabla();
  }

  function actualizarDashboardUsuarios() {
    const statTotal = document.getElementById("stat-total-usuarios");
    const statAdmins = document.getElementById("stat-total-admins");
    const statCajeros = document.getElementById("stat-total-cajeros");
    const statRepositores = document.getElementById("stat-total-repositores");

    if (statTotal) statTotal.textContent = usuariosBase.length;
    if (statAdmins) {
      statAdmins.textContent = usuariosBase.filter(
        (u) => u.rol === "admin",
      ).length;
    }
    if (statCajeros) {
      statCajeros.textContent = usuariosBase.filter(
        (u) => u.rol === "cajero",
      ).length;
    }
    if (statRepositores) {
      statRepositores.textContent = usuariosBase.filter(
        (u) => u.rol === "repositor",
      ).length;
    }
  }

  // Filtros y ordenamiento
  const selectFiltroRol = document.getElementById("select-filtro-rol");
  const inputBuscarUsuario = document.getElementById("buscar-usuario");

  function aplicarFiltrosUsuarios() {
    const termino = inputBuscarUsuario
      ? inputBuscarUsuario.value.toLowerCase().trim()
      : "";
    const rolSeleccionado = selectFiltroRol ? selectFiltroRol.value : "todos";

    usuariosFiltrados = usuariosBase.filter((user) => {
      const nombreTexto = user.nombre ? user.nombre.toLowerCase() : "";
      const idTexto = user.id ? user.id.toString().toLowerCase() : "";
      const coincideTexto =
        nombreTexto.includes(termino) || idTexto.includes(termino);

      let coincideRol = true;
      if (rolSeleccionado && rolSeleccionado !== "todos") {
        coincideRol = user.rol === rolSeleccionado;
      }

      return coincideTexto && coincideRol;
    });

    paginaActualUsuarios = 1;
    renderizarTablaUsuarios();
  }

  if (selectFiltroRol)
    selectFiltroRol.addEventListener("change", aplicarFiltrosUsuarios);
  if (inputBuscarUsuario)
    inputBuscarUsuario.addEventListener("input", aplicarFiltrosUsuarios);

  function asignarEventosOrdenamientoUsuarios() {
    const cabeceras = document.querySelectorAll(".sortable-usuario");
    cabeceras.forEach((cabecera) => {
      cabecera.addEventListener("click", () => {
        const columna = cabecera.getAttribute("data-sort");

        if (columnaOrdenUsuarios === columna) {
          ordenAscendenteUsuarios = !ordenAscendenteUsuarios;
        } else {
          columnaOrdenUsuarios = columna;
          ordenAscendenteUsuarios = true;
        }

        usuariosFiltrados.sort((a, b) => {
          let valA = a[columna] != null ? a[columna] : "";
          let valB = b[columna] != null ? b[columna] : "";

          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();

          if (valA < valB) return ordenAscendenteUsuarios ? -1 : 1;
          if (valA > valB) return ordenAscendenteUsuarios ? 1 : -1;
          return 0;
        });

        cabeceras.forEach((th) => {
          const icono = th.querySelector("i");
          if (icono) {
            icono.setAttribute("data-lucide", "arrow-up-down");
            icono.style.color = "#a1a1aa";
          }
        });
        const iconoActivo = cabecera.querySelector("i");
        if (iconoActivo) {
          iconoActivo.setAttribute(
            "data-lucide",
            ordenAscendenteUsuarios ? "arrow-up" : "arrow-down",
          );
          iconoActivo.style.color = "#759627";
          if (typeof lucide !== "undefined") lucide.createIcons();
        }

        renderizarTablaUsuarios();
      });
    });
  }
  asignarEventosOrdenamientoUsuarios();

  // Paginación
  function actualizarControlesPaginacionUsuarios() {
    const contenedorNumeros = document.getElementById(
      "numeros-paginacion-usuarios",
    );
    const btnAnterior = document.getElementById("btn-anterior-usuarios");
    const btnSiguiente = document.getElementById("btn-siguiente-usuarios");
    const spanInfoTotal = document.getElementById("info-total-usuarios");

    if (!contenedorNumeros) return;

    const totalPaginas =
      Math.ceil(usuariosFiltrados.length / itemsPorPaginaUsuarios) || 1;

    if (btnAnterior) btnAnterior.disabled = paginaActualUsuarios === 1;
    if (btnSiguiente)
      btnSiguiente.disabled = paginaActualUsuarios === totalPaginas;
    if (spanInfoTotal)
      spanInfoTotal.textContent = `Mostrando ${usuariosFiltrados.length} usuarios`;

    contenedorNumeros.innerHTML = "";
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.className = `btn-fantasma ${i === paginaActualUsuarios ? "active" : ""}`;
      btn.textContent = i;
      btn.addEventListener("click", () => {
        paginaActualUsuarios = i;
        renderizarTablaUsuarios();
      });
      contenedorNumeros.appendChild(btn);
    }
  }

  const btnAnt = document.getElementById("btn-anterior-usuarios");
  const btnSig = document.getElementById("btn-siguiente-usuarios");
  if (btnAnt && btnSig) {
    btnAnt.addEventListener("click", () => {
      if (paginaActualUsuarios > 1) {
        paginaActualUsuarios--;
        renderizarTablaUsuarios();
      }
    });
    btnSig.addEventListener("click", () => {
      const totalPaginas = Math.ceil(
        usuariosFiltrados.length / itemsPorPaginaUsuarios,
      );
      if (paginaActualUsuarios < totalPaginas) {
        paginaActualUsuarios++;
        renderizarTablaUsuarios();
      }
    });
  }

  function confirmarBorradoUsuario(nombreUsuario, accionConfirmada) {
    const dialog = document.createElement("dialog");
    dialog.className = "modal-base";

    dialog.innerHTML = `
    <div class="modal-contenido" style="text-align: center; max-width: 400px; padding: 24px;">
      <!-- Ícono rojo -->
      <div style="background-color: #fef2f2; color: #ef4444; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <i data-lucide="alert-triangle" style="width: 32px; height: 32px;"></i>
      </div>

      <h3 style="margin-top: 0; margin-bottom: 8px;">¿Borrar usuario?</h3>
      <p style="color: #4b5563; margin-bottom: 24px; font-size: 14px;">
        Estás a punto de borrar a <strong>${nombreUsuario}</strong>. Esta acción no se puede deshacer.
      </p>
      
      <div class="modal-acciones" style="display: flex; gap: 12px; justify-content: center;">
        <button type="button" class="btn-fantasma" id="btn-cancelar-borrar">Cancelar</button>
        <button type="button" class="btn-alerta" id="btn-confirmar-borrar">Sí, borrar</button>
      </div>
    </div>
  `;

    document.body.appendChild(dialog);

    if (typeof lucide !== "undefined") lucide.createIcons();

    dialog.showModal();

    dialog
      .querySelector("#btn-cancelar-borrar")
      .addEventListener("click", () => {
        dialog.close();
        dialog.remove();
      });

    dialog
      .querySelector("#btn-confirmar-borrar")
      .addEventListener("click", () => {
        dialog.close();
        dialog.remove();
        accionConfirmada();
      });
  }

  // Modal edicion y borrado
  const modalEdicion = document.getElementById("modal-usuario");
  const formEdicion = document.getElementById("form-usuario");
  const btnBorrarUsuario = document.getElementById("btn-borrar-usuario");

  function asignarEventosBotonesTabla() {
    tbodyUsuarios.querySelectorAll(".btn-editar-usuario").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const user = usuariosBase.find((u) => String(u.id) === String(id));

        if (user && modalEdicion) {
          document.getElementById("modal-usuario-id").value = user.id;
          document.getElementById("modal-nombre-usuario").textContent =
            user.nombre;
          document.getElementById("modal-rol-usuario").value = user.rol;
          document.getElementById("modal-usuario-habilitado").value =
            user.habilitado !== false ? "true" : "false";

          modalEdicion.showModal();
        }
      });
    });
  }

  document
    .querySelectorAll("#cerrar-modal-usuario, #btn-cancelar-modal-usuario")
    .forEach((btn) => {
      if (btn) btn.addEventListener("click", () => modalEdicion.close());
    });

  if (formEdicion) {
    formEdicion.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("modal-usuario-id").value;
      const payload = {
        rol: document.getElementById("modal-rol-usuario").value,
        habilitado:
          document.getElementById("modal-usuario-habilitado").value === "true",
      };

      try {
        const res = await fetch(`/api/usuarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Fallo al actualizar");

        if (typeof mostrarToast === "function")
          mostrarToast("Usuario actualizado");
        modalEdicion.close();
        cargarUsuarios();
      } catch (error) {
        console.error(error);
        if (typeof mostrarToast === "function")
          mostrarToast("Error al guardar", true);
      }
    });
  }

  if (btnBorrarUsuario) {
    btnBorrarUsuario.addEventListener("click", () => {
      const id = document.getElementById("modal-usuario-id").value;
      const nombre = document.getElementById(
        "modal-nombre-usuario",
      ).textContent;

      confirmarBorradoUsuario(nombre, async () => {
        try {
          const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Fallo al borrar");

          if (typeof mostrarToast === "function") {
            mostrarToast("Usuario eliminado correctamente");
          }

          modalEdicion.close(); 
          cargarUsuarios(); 
        } catch (error) {
          console.error(error);
          if (typeof mostrarToast === "function") {
            mostrarToast("Error al eliminar el usuario", true);
          }
        }
      });
    });
  }

  // Modal crear usuario
  const modalCrear = document.getElementById("modal-crear-usuario");
  const formCrear = document.getElementById("form-crear-usuario");
  const btnCerrarCrear = document.getElementById("cerrar-modal-crear-usuario");
  const btnCancelarCrear = document.getElementById(
    "btn-cancelar-crear-usuario",
  );
  const btnAbrirModalCrear = document.getElementById("btn-nuevo-usuario");

  // --- Abrir modal ---
  if (btnAbrirModalCrear) {
    btnAbrirModalCrear.addEventListener("click", (e) => {
      e.preventDefault();
      if (formCrear) formCrear.reset();
      if (modalCrear && typeof modalCrear.showModal === "function") {
        modalCrear.showModal();
      }
    });
  }

  // --- Cerrar modal ---
  [btnCerrarCrear, btnCancelarCrear].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (modalCrear) modalCrear.close();
      });
    }
  });

  // --- Enviar datos al Backend (POST) ---
  if (formCrear) {
    formCrear.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nuevoUsuario = {
        nombre: document.getElementById("crear-nombre").value,
        apellido: document.getElementById("crear-apellido").value,
        email: document.getElementById("crear-email").value,
        contraseña: document.getElementById("crear-contraseña").value,
        rol: document.getElementById("crear-rol").value,
        habilitado: true, // Nace activo por defecto
      };

      try {
        const respuesta = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario),
        });

        if (!respuesta.ok) {
          const errorData = await respuesta.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al crear el usuario en el servidor",
          );
        }
        modalCrear.close();
        await cargarUsuarios();

        mostrarToast("¡Usuario creado y guardado con éxito!");

        if (typeof lucide !== "undefined") lucide.createIcons();
      } catch (error) {
        console.error(error);
        mostrarToast(
          error.message || "Hubo un error al crear el usuario.",
          true,
        );
      }
    });
  }

  const btnMenuUsuarios = document.querySelector('[data-nav="vista-usuarios"]');
  if (btnMenuUsuarios) {
    btnMenuUsuarios.addEventListener("click", () => {
      if (usuariosBase.length === 0) {
        cargarUsuarios();
      }
    });
  }
});
