import { mostrarToast } from "../common/utils/alertas.js";

async function solicitarApi(url, opciones = {}) {
  const respuesta = await fetch(url, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(
      error.detail || error.message || `Error HTTP ${respuesta.status}`,
    );
  }

  return respuesta.status === 204 ? null : respuesta.json();
}

document.addEventListener("DOMContentLoaded", () => {
  const formNegocio = document.getElementById("form-negocio");
  const formSesion = document.getElementById("form-sesion");
  const formStock = document.getElementById("form-alertas-stock");
  const formNuevaCategoria = document.getElementById("form-nueva-categoria");
  const gridCategorias = document.getElementById("grid-categorias");
  const inputNuevaCategoria = document.getElementById("nueva-categoria-nombre");
  const inputsNegocio = {
    nombre: document.getElementById("negocio-nombre"),
    telefono: document.getElementById("negocio-telefono"),
    direccion: document.getElementById("negocio-direccion"),
  };
  const previewNegocio = {
    nombre: document.getElementById("negocio-preview-nombre"),
    telefono: document.getElementById("negocio-preview-telefono"),
    direccion: document.getElementById("negocio-preview-direccion"),
  };
  let categorias = [];

  function actualizarVistaPreviaNegocio() {
    previewNegocio.nombre.textContent =
      inputsNegocio.nombre.value.trim() || "Nombre del negocio";
    previewNegocio.telefono.textContent =
      inputsNegocio.telefono.value.trim() || "Sin especificar";
    previewNegocio.direccion.textContent =
      inputsNegocio.direccion.value.trim() || "Sin especificar";
  }

  async function cargarConfiguracion() {
    const { configuracion } = await solicitarApi("/api/configuracion");
    const negocio = configuracion.negocio;

    inputsNegocio.nombre.value = negocio.nombre;
    inputsNegocio.telefono.value = negocio.telefono;
    inputsNegocio.direccion.value = negocio.direccion;
    actualizarVistaPreviaNegocio();
    document.getElementById("tiempo-inactividad").value = String(
      configuracion.sessionDurationMinutes,
    );
    document.getElementById("stock-critico").value =
      configuracion.stock.critico;
    document.getElementById("stock-medio").value = configuracion.stock.medio;
  }

  Object.values(inputsNegocio).forEach((input) => {
    input.addEventListener("input", actualizarVistaPreviaNegocio);
  });

  function renderizarCategorias() {
    gridCategorias.replaceChildren();

    for (const categoria of categorias) {
      const card = document.createElement("article");
      card.className = "cat-card";

      const header = document.createElement("div");
      header.className = "cat-header";
      const title = document.createElement("h4");
      title.textContent = categoria.nombre;

      const actions = document.createElement("div");
      actions.className = "cat-acciones";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "cat-btn-icono rojo btn-eliminar-cat";
      deleteButton.dataset.id = categoria.id;
      deleteButton.title = categoria.productos.length
        ? "No se puede eliminar una categoría con productos"
        : "Eliminar categoría";
      deleteButton.setAttribute("aria-label", deleteButton.title);
      deleteButton.textContent = "X";
      deleteButton.disabled = categoria.productos.length > 0;
      actions.append(deleteButton);
      header.append(title, actions);

      const body = document.createElement("div");
      body.className = "cat-body";
      const badge = document.createElement("span");
      badge.className = "cat-badge";
      badge.textContent = `${categoria.productos.length} productos`;

      const list = document.createElement("ul");
      list.className = "cat-productos-preview";
      for (const producto of categoria.productos.slice(0, 3)) {
        const item = document.createElement("li");
        item.textContent = producto;
        list.append(item);
      }

      if (categoria.productos.length > 3) {
        const extra = document.createElement("li");
        extra.className = "cat-mas-items";
        extra.textContent = `+ ${categoria.productos.length - 3} producto(s) más...`;
        list.append(extra);
      } else if (categoria.productos.length === 0) {
        const empty = document.createElement("li");
        empty.className = "cat-mas-items";
        empty.textContent = "Categoría vacía";
        list.append(empty);
      }

      body.append(badge, list);
      card.append(header, body);
      gridCategorias.append(card);
    }
  }

  async function cargarCategorias() {
    const resultado = await solicitarApi("/api/configuracion/categorias");
    categorias = resultado.categorias;
    renderizarCategorias();
  }

  formNegocio.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await solicitarApi("/api/configuracion", {
        method: "PATCH",
        body: JSON.stringify({
          negocio: {
            nombre: inputsNegocio.nombre.value.trim(),
            telefono: inputsNegocio.telefono.value.trim(),
            direccion: inputsNegocio.direccion.value.trim(),
          },
        }),
      });
      actualizarVistaPreviaNegocio();
      mostrarToast("Datos del negocio guardados");
    } catch (error) {
      console.error("Error guardando los datos del negocio:", error);
      mostrarToast(error.message || "No se pudieron guardar los datos", true);
    }
  });

  formSesion.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const sessionDurationMinutes = Number(
        document.getElementById("tiempo-inactividad").value,
      );
      await solicitarApi("/api/configuracion", {
        method: "PATCH",
        body: JSON.stringify({ sessionDurationMinutes }),
      });
      mostrarToast("Duración de sesión guardada");
    } catch (error) {
      console.error("Error guardando la duración de sesión:", error);
      mostrarToast(error.message || "No se pudo guardar la duración", true);
    }
  });

  formStock.addEventListener("submit", async (event) => {
    event.preventDefault();
    const critico = Number(document.getElementById("stock-critico").value);
    const medio = Number(document.getElementById("stock-medio").value);
    if (
      !Number.isInteger(critico) ||
      !Number.isInteger(medio) ||
      critico < 0 ||
      medio <= critico
    ) {
      mostrarToast(
        "El stock crítico debe ser un entero no negativo y menor al stock medio",
        true,
      );
      return;
    }

    try {
      await solicitarApi("/api/configuracion", {
        method: "PATCH",
        body: JSON.stringify({ stock: { critico, medio } }),
      });
      mostrarToast("Niveles de stock guardados");
    } catch (error) {
      console.error("Error guardando los niveles de stock:", error);
      mostrarToast(error.message || "No se pudieron guardar los niveles", true);
    }
  });

  formNuevaCategoria.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nombre = inputNuevaCategoria.value.trim();
    if (!nombre) return;

    try {
      const resultado = await solicitarApi("/api/configuracion/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre }),
      });
      categorias.push(resultado.categoria);
      inputNuevaCategoria.value = "";
      renderizarCategorias();
      mostrarToast("Categoría agregada");
    } catch (error) {
      console.error("Error creando la categoría:", error);
      mostrarToast(error.message || "No se pudo crear la categoría", true);
    }
  });

  gridCategorias.addEventListener("click", async (event) => {
    const button = event.target.closest(".btn-eliminar-cat");
    if (!button || button.disabled) return;

    const categoria = categorias.find(
      (item) => String(item.id) === button.dataset.id,
    );
    if (!categoria || !window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    try {
      await solicitarApi(
        `/api/configuracion/categorias/${encodeURIComponent(categoria.id)}`,
        { method: "DELETE" },
      );
      categorias = categorias.filter((item) => item.id !== categoria.id);
      renderizarCategorias();
      mostrarToast("Categoría eliminada");
    } catch (error) {
      console.error("Error eliminando la categoría:", error);
      mostrarToast(error.message || "No se pudo eliminar la categoría", true);
    }
  });

  cargarConfiguracion().catch((error) => {
    console.error("Error cargando la configuración:", error);
    mostrarToast(error.message || "No se pudo cargar la configuración", true);
  });
  cargarCategorias().catch((error) => {
    console.error("Error cargando las categorías:", error);
    mostrarToast(error.message || "No se pudieron cargar las categorías", true);
  });
});
