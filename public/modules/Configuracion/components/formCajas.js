export function crearFormCajas({ api, notificar }) {
    const formNuevaCaja = document.getElementById("form-nueva-caja");
    const inputNuevaCaja = document.getElementById("nueva-caja-nombre");
    const listaCajas = document.getElementById("lista-cajas");
    const modalEditarCaja = document.getElementById("modal-editar-caja");
    const formEditarCaja = document.getElementById("form-editar-caja");
    const inputEditarCaja = document.getElementById("editar-caja-nombre");
    const btnCerrarModalEditarCaja = document.getElementById("cerrar-modal-editar-caja");
    const btnCancelarModalEditarCaja = document.getElementById("btn-cancelar-modal-editar-caja");

    let nombreCajaActual = "";

    const cerrarModal = () => {
        nombreCajaActual = "";
        formEditarCaja?.reset();
        modalEditarCaja?.close();
    };

    const cargarCajas = async () => {
        const resultado = await api.listarCajas();
        renderizar(resultado?.cajas);
    };

    const renderizar = (cajas) => {
        if (!listaCajas) return;
        listaCajas.innerHTML = "";
        (cajas ?? []).forEach((caja) => {
            const nombre = typeof caja === "string" ? caja : caja?.nombre ?? caja?.nroCaja ?? "";
            const item = document.createElement("li");
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "8px";
            item.style.padding = "4px 0";

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.title = "Editar caja";
            btnEditar.setAttribute("aria-label", `Editar ${nombre}`);
            btnEditar.style.background = "none";
            btnEditar.style.border = "none";
            btnEditar.style.padding = "2px";
            btnEditar.style.cursor = "pointer";
            btnEditar.style.display = "inline-flex";
            btnEditar.style.alignItems = "center";
            btnEditar.innerHTML = '<i data-lucide="pencil" aria-hidden="true" style="width:16px;height:16px"></i>';
            btnEditar.addEventListener("click", () => {
                nombreCajaActual = nombre;
                if (inputEditarCaja) inputEditarCaja.value = nombre;
                modalEditarCaja?.showModal();
            });

            const texto = document.createElement("span");
            texto.textContent = nombre;

            item.append(btnEditar, texto);
            listaCajas.appendChild(item);
        });

        if (window.lucide?.createIcons) {
            window.lucide.createIcons();
        }
    };

    btnCerrarModalEditarCaja?.addEventListener("click", cerrarModal);
    btnCancelarModalEditarCaja?.addEventListener("click", cerrarModal);
    modalEditarCaja?.addEventListener("click", (event) => {
        if (event.target === modalEditarCaja) cerrarModal();
    });

    formEditarCaja?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const nuevoNombre = inputEditarCaja?.value?.trim();
        if (!nuevoNombre || !nombreCajaActual || nuevoNombre === nombreCajaActual) {
            cerrarModal();
            return;
        }

        try {
            await api.actualizarCaja(nombreCajaActual, { nombre: nuevoNombre });
            notificar("Caja actualizada");
            cerrarModal();
            await cargarCajas();
        } catch (error) {
            console.error("Error actualizando la caja:", error);
            notificar(error.message || "No se pudo actualizar la caja", true);
        }
    });

    formNuevaCaja?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = inputNuevaCaja?.value?.trim();
        if (!nombre) return;

        try {
            await api.crearCaja({ nombre });
            if (inputNuevaCaja) inputNuevaCaja.value = "";
            notificar("Caja agregada");
            await cargarCajas();
        } catch (error) {
            console.error("Error creando la caja:", error);
            notificar(error.message || "No se pudo crear la caja", true);
        }
    });

    return {
        async cargar() {
            try {
                await cargarCajas();
            } catch (error) {
                console.error("Error cargando las cajas:", error);
            }
        },
    };
}