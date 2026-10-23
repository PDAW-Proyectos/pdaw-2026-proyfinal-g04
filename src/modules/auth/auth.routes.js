import { Router } from "express";
import { AuthController } from "./auth.controller.js";

export default function crearRouterAuth(
    authController = new AuthController()
) {
    const router = Router();

    router.post("/login", authController.login);
    

    return router;
}
