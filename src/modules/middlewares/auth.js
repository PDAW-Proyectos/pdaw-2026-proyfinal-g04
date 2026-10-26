// Verifica que exista una sesión activa
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Es necesario iniciar sesión" });
  }
  next();
}

// 2. Autorización: verifica si el rol guardado en la sesión tiene permiso
export function allowRoles(...rolesPermitidos) {
  return (req, res, next) => {
    // Si no está autenticado, responde 401
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Es necesario iniciar sesión" });
    }

    const rolUsuario = req.session.role;

    // Regla de oro: Admin entra a todo; sino, debe estar en la lista de roles permitidos
    if (rolUsuario === "admin" || rolesPermitidos.includes(rolUsuario)) {
      return next();
    }

    // Si fallan los permisos: 403 Forbidden
    return res.status(403).json({ error: "Sin permisos suficientes para este recurso" });
  };
}
