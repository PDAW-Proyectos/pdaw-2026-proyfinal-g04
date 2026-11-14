export function actualizarStatsUsuarios(usuarios) {
    const statTotal = document.getElementById("stat-total-usuarios");
    const statAdmins = document.getElementById("stat-total-admins");
    const statCajeros = document.getElementById("stat-total-cajeros");
    const statRepositores = document.getElementById("stat-total-repositores");

    if (statTotal) statTotal.textContent = usuarios.length;
    if (statAdmins) {
        statAdmins.textContent = usuarios.filter((u) => u.rol === "admin").length;
    }
    if (statCajeros) {
        statCajeros.textContent = usuarios.filter((u) => u.rol === "cajero").length;
    }
    if (statRepositores) {
        statRepositores.textContent = usuarios.filter((u) => u.rol === "repositor").length;
    }
}
