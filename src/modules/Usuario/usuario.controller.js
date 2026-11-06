import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    listarUsuarios = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const usuarios = await this.userService.listarUsuarios(pagina, limite);
        res.status(200).json(usuarios);
    }

    filtrarUsuarios = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const usuarios = await this.userService.filtrarUsuarios(req.body, pagina, limite);
        res.status(200).json(usuarios);
    }

    buscarUsuario = async (req, res) => {
        const usuario = await this.userService.buscarUsuario(req.params.id);
        res.status(200).json(usuario);
    }

    crearUsuario = async (req, res) => {
        const usuario = await this.userService.crearUsuario(req.body);
        res.status(201).json(usuario);
    }

    actualizarUsuario = async (req, res) => {
        const usuario = await this.userService.actualizarUsuario(req.params.id, req.body);
        res.status(200).json(usuario);
    }

    eliminarUsuario = async (req, res) => {
        await this.userService.eliminarUsuario(req.params.id);
        res.status(204).send();
    }
}