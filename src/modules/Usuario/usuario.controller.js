
import { UserService } from "./usuario.service.js";

export class UserController {
    userService;

    constructor(userService) {
        this.userService = userService;
        this.listarUsuarios = this.listarUsuarios.bind(this);
        this.buscarUsuario = this.buscarUsuario.bind(this);
        this.crearUsuario = this.crearUsuario.bind(this);
        this.actualizarUsuario = this.actualizarUsuario.bind(this);
        this.eliminarUsuario = this.eliminarUsuario.bind(this);
    }

    async listarUsuarios(req, res, next) {
        try {
            const usuarios = await this.userService.getUsuarios();
            res.status(200).json(usuarios);
        } catch (error) {
            next(error);
        }
    }

    async buscarUsuario(req, res, next) {
        try {
            const usuario = await this.userService.getUsuario(req.params.id);
            res.status(200).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async crearUsuario(req, res, next) {
        try {
            const usuario = await this.userService.crearUsuario(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async actualizarUsuario(req, res, next) {
        try {
            const usuario = await this.userService.actualizarUsuario(
                req.params.id,
                req.body
            );

            res.status(200).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    async eliminarUsuario(req, res, next) {
        try {
            await this.userService.eliminarUsuario(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
