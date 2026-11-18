export function crearFormCajas({ api, notificar }) {
    const formNuevaCaja = document.getElementById("form-nueva-caja");
    const inputNuevaCaja = document.getElementById("nueva-caja-nombre");
    const listaCajas = document.getElementById("lista-cajas");

    const renderizar = (cajas) => {
        if (!listaCajas) return;
        listaCajas.innerHTML = "";
        (cajas ?? []).forEach((caja) => {
            const nombre = typeof caja === "string" ? caja : caja?.nombre ?? caja?.nroCaja ?? "";
            const item = document.createElement("li");
            item.textContent = nombre;
            item.style.padding = "4px 0";
            listaCajas.appendChild(item);
        });
    };

    formNuevaCaja?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = inputNuevaCaja?.value?.trim();
        if (!nombre) return;

        try {
            await api.crearCaja({ nombre });
            if (inputNuevaCaja) inputNuevaCaja.value = "";
            notificar("Caja agregada");
            const resultado = await api.listarCajas();
            renderizar(resultado?.cajas);
        } catch (error) {
            console.error("Error creando la caja:", error);
            notificar(error.message || "No se pudo crear la caja", true);
        }
    });

    return {
        async cargar() {
            try {
                const resultado = await api.listarCajas();
                renderizar(resultado?.cajas);
            } catch (error) {
                console.error("Error cargando las cajas:", error);
            }
        },
    };
}