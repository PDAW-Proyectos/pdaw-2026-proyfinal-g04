import { Router } from "express";
import { allowRoles, requireAuth } from "../../common/middlewares/auth.guard.js";

export default function crearRouterAuth(authController) {
	const router = Router();
	router.post("/login", authController.login);
	router.post("/signup", allowRoles("admin"), authController.signup);
	router.post("/logout", authController.logout);
	router.get("/me", requireAuth, authController.me);
	router.put("/me", requireAuth, authController.actualizarPerfil);

	return router;
}
