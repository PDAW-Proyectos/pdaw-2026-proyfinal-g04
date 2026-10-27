
import { UserService } from "./usuario.service.js";

export class UserController {
    userService;

    constructor(userService) {
        this.userService = userService;
    }

    listarUsuarios = async (req, res, next) => {
        try {
            const usuarios = await this.userService.listarUsuarios();
            res.status(200).json(usuarios);
        } catch (error) {
            next(error);
        }
    }

    buscarUsuario = async (req, res, next) => {
        try { 
            const usuario = await this.userService.buscarUsuario(req.params.id);
            res.status(200).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    crearUsuario = async (req, res, next) => {
        try {
            const usuario = await this.userService.crearUsuario(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            next(error);
        }
    }

    actualizarUsuario = async (req, res, next) => {
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

    eliminarUsuario = async (req, res, next) => {
        try {
            await this.userService.eliminarUsuario(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
