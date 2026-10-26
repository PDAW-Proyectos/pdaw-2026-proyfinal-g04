import bcrypt from "bcrypt";

export class AuthService {
  userService;

  constructor(userService) {
    this.userService = userService;
  }

  async login({ email, password, requestedRole }) {
    const credenciales = await this.userService.buscarUsuarioPorEmail(email);

    if (
      !credenciales ||
      !(await bcrypt.compare(
        password,
        credenciales.contraseña || credenciales.password,
      ))
    ) {
      const error = new Error("Email o contraseña incorrectos");
      error.status = 401;
      throw error;
    }

    const rolReal = credenciales.rol || credenciales.role;

    // Si el usuario intenta entrar desde una solapa que no coincide con su rol real:
    if (requestedRole && rolReal !== "admin" && rolReal !== requestedRole) {
      const error = new Error("No tienes permisos para acceder con este rol");
      error.status = 403;
      throw error;
    }

    return {
      idUsuario: credenciales.idUsuario || credenciales.id,
      nombre: credenciales.nombre,
      email: credenciales.email,
      role: rolReal,
      mensaje: "Inicio de sesión exitoso",
    };
  }
}
