import path from "node:path";

// Verifica que exista una sesión activa
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    // Si viene desde el navegador por URL, redirige al login
    if (req.accepts("html")) {
      return res.redirect("/login.html");
    }
    return res.status(401).json({ error: "Es necesario iniciar sesión" });
  }
  next();
}

// 2. Autorización: verifica si el rol guardado en la sesión tiene permiso
export function allowRoles(...rolesPermitidos) {
  return (req, res, next) => {
    // Si no está autenticado, va al login
    if (!req.session || !req.session.userId) {
      if (req.accepts("html")) {
        return res.redirect("/login.html");
      }
      return res.status(401).json({ error: "Es necesario iniciar sesión" });
    }

    const rolUsuario = req.session.role;

    // Regla de oro: Admin entra a todo; sino, debe estar en la lista de roles permitidos
    if (rolUsuario === "admin" || rolesPermitidos.includes(rolUsuario)) {
      return next();
    }

    // Si fallan los permisos: 403 Forbidden
    if (req.accepts("html")) {
      return res
        .status(403)
        .sendFile(path.join(process.cwd(), "public", "accesoDenegado.html"));
    }
    return res.status(403).json({ error: "Acceso denegado" });
  };
}
