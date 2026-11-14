import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearTablaUsuarios({ tbody, onEditar }) {
    if (tbody) {
        tbody.addEventListener("click", (event) => {
            const button = event.target.closest(".btn-editar-usuario");
            if (!button) return;
            onEditar(button.getAttribute("data-id"));
        });
    }

    return {
        render(usuarios) {
            if (!tbody) return;

            tbody.innerHTML = "";

            usuarios.forEach((user) => {
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
                    <td><span class="badge ${claseEstado}">${textoEstado}</span></td>
                    <td>
                        <button class="btn-editar-usuario btn-primario btn-chico" data-id="${user.id}" title="Editar" style="padding: 6px;">
                        <i data-lucide="settings" class="icono-chico"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            renderizarIconos();
        },
    };
}
