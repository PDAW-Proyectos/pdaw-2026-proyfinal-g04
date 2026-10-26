export class AuthController {
  authService;

  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res) => {
    try {
      const email = req.body.email || req.body.correo;
      const password = req.body.password || req.body.contrasena;
      const requestedRole = req.body.requestedRole;

      const user = await this.authService.login({ email, password });

      if (user.role !== "admin" && requestedRole !== user.role) {
        return res.status(403).json({
          error: "No tenés permisos para ingresar a esta área",
        });
      }

      // 1. Regenerar sesión para mitigar fijación de sesión (Clase 08)
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Error al regenerar sesión" });
        }

        // 2. Guardar datos mínimos de identidad en la sesión
        req.session.userId = user.idUsuario || user.id;
        req.session.role = user.role;

        // 3. Forzar el guardado antes de responder para asegurar la cabecera Set-Cookie
        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ error: "Error al guardar sesión" });
          }
          return res.status(200).json(user);
        });
      });
    } catch (error) {
      return res.status(error.status || 401).json({
        error: error.message || "Credenciales incorrectas",
      });
    }
  };
}
