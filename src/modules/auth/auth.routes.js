import { Router } from "express";

export default function crearRouterAuth(authController) {
  const router = Router();

  if (!authController || typeof authController.login !== "function") {
    throw new TypeError(
      "authController debe ser una instancia válida con el método login",
    );
  }

  router.post("/login", authController.login);

  if (typeof authController.logout === "function") {
    router.post("/logout", authController.logout);
  }

  if (typeof authController.me === "function") {
    router.get("/me", authController.me);
  }

  return router;
}
