import { solicitarJson } from "../../common/api/httpClient.js";

export async function obtenerPerfilUsuario() {
    return await solicitarJson("/api/auth/me", {
        method: "GET"
    });
}

export async function actualizarDatosPerfil(datos) {
    return await solicitarJson("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(datos)
    });
}

export async function cerrarSesionUsuario() {
    return await solicitarJson("/api/auth/logout", {
        method: "POST"
    });
}

export async function cambiarPasswordUsuario(datos) {
  return await httpClient("/api/auth/password", {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}