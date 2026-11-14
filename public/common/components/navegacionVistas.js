export function iniciarNavegacionVistas({ selectorEnlaces = ".nav-enlace", selectorVistas = ".vista", claseActivaEnlace = "active", claseActivaVista = "active", atributoDestino = "data-nav" } = {}) {
    const enlaces = document.querySelectorAll(selectorEnlaces);
    const vistas = document.querySelectorAll(selectorVistas);

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", (event) => {
            event.preventDefault();

            const destino = enlace.getAttribute(atributoDestino);
            if (!destino) return;

            enlaces.forEach((item) => item.classList.remove(claseActivaEnlace));
            vistas.forEach((vista) => vista.classList.remove(claseActivaVista));

            enlace.classList.add(claseActivaEnlace);
            document.getElementById(destino)?.classList.add(claseActivaVista);
        });
    });
}
