import { jest } from "@jest/globals";
import { AuthController } from "../../../src/modules/auth/auth.controller.js";

describe("AuthController", () => {
    test("actualizarPerfil usa el ID de la sesión, no uno del cliente", async () => {
        const perfil = {
            idUsuario: 7,
            nombre: "Ana",
            apellido: "Pérez",
            email: "ana@test.com",
            rol: "repositor"
        };
        const authService = {
            actualizarPerfil: jest.fn().mockResolvedValue(perfil)
        };
        const controller = new AuthController(authService);
        const req = {
            session: { userId: 7 },
            body: {
                nombre: "Ana",
                apellido: "Pérez",
                email: "ana@test.com"
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await controller.actualizarPerfil(req, res);

        expect(authService.actualizarPerfil).toHaveBeenCalledWith(7, req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(perfil);
    });
});
