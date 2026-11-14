export function crearPaginador({ contenedor, btnAnterior, btnSiguiente, info = null, onSeleccionar }) {
    let paginaActual = 1;
    let totalPaginas = 1;

    const irA = (pagina) => {
        if (pagina < 1 || pagina > totalPaginas) return;
        onSeleccionar(pagina);
    };

    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => irA(paginaActual - 1));
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", () => irA(paginaActual + 1));
    }

    return {
        render({ pagina: paginaNueva, totalPaginas: totalNuevo, textoInfo = "" }) {
            paginaActual = paginaNueva;
            totalPaginas = totalNuevo;

            if (info) info.textContent = textoInfo;
            if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
            if (btnSiguiente) {
                btnSiguiente.disabled = paginaActual === totalPaginas || totalPaginas === 0;
            }
            if (!contenedor) return;

            contenedor.innerHTML = "";

            for (let i = 1; i <= totalPaginas; i++) {
                const btnNumero = document.createElement("button");
                btnNumero.className = `btn-fantasma ${i === paginaActual ? "active" : ""}`;
                btnNumero.textContent = i;
                btnNumero.addEventListener("click", () => onSeleccionar(i));
                contenedor.appendChild(btnNumero);
            }
        },
    };
}
