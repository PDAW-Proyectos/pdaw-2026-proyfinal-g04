import { AuthService } from "./auth.service.js";

export class AuthController {
    authService;

    constructor(authService) {
        this.authService = authService;
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);
    }

    async signup(req, res, next) {
        try {
            console.log(this.authService);
            const usuario = await this.authService.signup(req.body);

            return res.status(201).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const resultado = await this.authService.login(req.body);

            return res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}