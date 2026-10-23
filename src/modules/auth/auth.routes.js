import { Router } from "express";
import { AuthController } from "./auth.controller.js";

export default function crearRouterAuth(
    authController
) {
    const router = Router();

    router.post("/login", authController.login);
    router.post("/signup", authController.signup);
    

    return router;
}
