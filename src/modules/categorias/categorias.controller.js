import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class CategoriasController {
    constructor(categoriasService) {
        this.categoriasService = categoriasService;
    }

    listarCategorias = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const categorias = this.categoriasService.listarCategorias(pagina, limite);
        res.status(200).json({ categorias });
    };

    buscarCategoria = async (req, res) => {
        const categoria = this.categoriasService.buscarCategoria(req.params.id);
        res.status(200).json({ categoria });
    };

    filtrarCategorias = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const categorias = this.categoriasService.filtrarCategorias(req.body, pagina, limite);
        res.status(200).json({ categorias });
    };

    crearCategoria = async (req, res) => {
        const categoria = await this.categoriasService.crearCategoria(req.body);
        res.status(201).json({ categoria });
    };

    actualizarNombreCategoria = async (req, res) => {
        const categoria = await this.categoriasService.actualizarNombreCategoria(req.params.id, req.body);
        res.status(201).json({ categoria });
    };

    actualizarProductosCategoria = async (req, res) => {
        const categoria = await this.categoriasService.actualizarProductosCategoria(req.params.id, req.body);
        res.status(201).json({ categoria });
    };

    eliminarCategoria = async (req, res) => {
        await this.categoriasService.eliminarCategoria(req.params.id);
        res.status(204).send();
    };    
}