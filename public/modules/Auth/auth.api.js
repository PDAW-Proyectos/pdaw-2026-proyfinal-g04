import { solicitarJson } from "../../common/api/httpClient.js";

export function crearAuthApi(base = "/api") {
    return {
        login({ email, password, rolSeleccionado }) {
            return solicitarJson(`${base}/auth/login`, {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    requestedRole: rolSeleccionado,
                }),
            });
        },
    };
}
