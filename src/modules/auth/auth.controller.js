export class AuthController {
    authService;

    constructor(authService) {
        this.authService = authService;
    }

    signup = async (req, res) => {
        const usuario = await this.authService.signup(req.body);

        return res.status(201).json(usuario);
    };

    login = async (req, res) => {
        const email = req.body.email || req.body.correo;
        const password = req.body.password || req.body.contrasena;
        const requestedRole = req.body.requestedRole;

        const user = await this.authService.login({
            email,
            password,
            requestedRole
        });

        // 1. Regenerar sesión para mitigar la fijación de sesión.
        await new Promise((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });

        // 2. Guardar datos mínimos de identidad en la sesión.
        req.session.userId = user.idUsuario || user.id;
        req.session.role = user.rol;

        // 3. Forzar el guardado antes de responder.
        await new Promise((resolve, reject) => {
            req.session.save((error) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });

        return res.status(200).json(user);
    };

    logout = async (req, res, next) => {
        try {
            await this.authService.logout(req.session);

            res.clearCookie("connect.sid");
            res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
        } catch (error) {
            next(error);
        }
    };

}
