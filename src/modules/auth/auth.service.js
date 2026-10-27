import bcrypt from "bcrypt";

export class AuthService {
  userService;

  constructor(userService) {
    this.userService = userService;
  }

  login = async ({ email, password, requestedRole }) => {
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

    if (requestedRole && rolReal !== "admin" && rolReal !== requestedRole) {
      const error = new Error("No tienes permisos para acceder con este rol");
      error.status = 403;
      throw error;
    }

    return {
      idUsuario: credenciales.idUsuario || credenciales.id,
      nombre: credenciales.nombre,
      email: credenciales.email,
      rol: rolReal,
      mensaje: "Inicio de sesión exitoso",
    };
  }
	
	signup = async ({ nombre, apellido, email, password, rol }) => {
		const exists = await this.userService.buscarUsuarioPorEmail(email);
		if(exists) throw new Error("El email está en uso")
		const contraseña = await bcrypt.hash(password, 12);

		const datos = {
			nombre,
			apellido,
			email,
			contraseña,
			rol
		};

		return await this.userService.crearUsuario(datos);
	}
}
