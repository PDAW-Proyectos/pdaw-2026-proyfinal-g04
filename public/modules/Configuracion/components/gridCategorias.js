import { confirmarAccion } from "../../../common/utils/confirmar.js";

export function crearGridCategorias({ store, api, notificar }) {
    const gridCategorias = document.getElementById("grid-categorias");

    const renderizar = () => {
        gridCategorias.replaceChildren();

        for (const categoria of store.obtenerCategorias()) {
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
            deleteButton.title = categoria.productos.length ? "No se puede eliminar una categoría con productos" : "Eliminar categoría";
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
    };

    gridCategorias.addEventListener("click", async (event) => {
        const button = event.target.closest(".btn-eliminar-cat");
        if (!button || button.disabled) return;

        const categoria = store.obtenerCategorias().find((item) => String(item.id) === button.dataset.id);

        if (!categoria) return;

        const confirmado = await confirmarAccion({
            titulo: "Eliminar categoría",
            mensaje: `¿Eliminar la categoría "${categoria.nombre}"?`,
            textoConfirmar: "Sí, eliminar",
            peligro: true,
        });

        if (!confirmado) return;

        try {
            await api.eliminarCategoria(categoria.id);
            store.eliminarCategoria(categoria.id);
            renderizar();
            notificar("Categoría eliminada");
        } catch (error) {
            console.error("Error eliminando la categoría:", error);
            notificar(error.message || "No se pudo eliminar la categoría", true);
        }
    });

    return { renderizar };
}
