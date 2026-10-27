import { Router } from "express";
import { allowRoles } from "../../common/middlewares/auth.guard.js";

export default function crearRouterAuth(authController) {
	const router = Router();
	router.post("/login", authController.login);
	router.post("/signup", allowRoles("admin"), authController.signup);
	
	if (typeof authController.logout === "function") {
		router.post("/logout", authController.logout);
	}

	if (typeof authController.me === "function") {
		router.get("/me", authController.me);
	}

	return router;
}
