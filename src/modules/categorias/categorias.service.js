
import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class CategoriasService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    listarCategorias = (pagina, limite) => {
        const { datos, ...paginacion } =  this.categoriaRepository.listar(pagina, limite);
        return {
            categorias: datos,
            ...paginacion
        }
    };


    buscarCategoria = (id) => {
        const categoria = this.categoriaRepository.buscarPorId(Number(id));

        if (!categoria) {
            throw new NotFoundError("No se encontró la categoría.");
        }

        return categoria;
    };

    filtrarCategorias = (filtros, pagina, limite) => {
        console.log(filtros);
        
        return this.categoriaRepository.listarPorPropiedades(filtros, pagina, limite);
    };


    crearCategoria = async (datos) => {
        if (!datos?.nombre?.trim()) {
            throw new BadRequestError("El nombre de la categoría es obligatorio.");
        }

        const categoriaExistente = this.categoriaRepository.listarPorPropiedades("nombre", datos.nombre.trim());

        if (categoriaExistente.datos.length > 0) {
            throw new BadRequestError("Ya existe una categoría con ese nombre.");
        }

        return await this.categoriaRepository.crear({
            nombre: datos.nombre.trim()
        });
    };

    actualizarNombreCategoria = async (id, datos) => {
        const categoria = this.categoriaRepository.buscarPorId(Number(id));

        if (!categoria) {
            throw new NotFoundError("No se encontró la categoría.");
        }

        if(datos?.nombre === undefined || !datos.nombre.trim()) {
            throw new BadRequestError("El nombre de la categoría no puede estar vacío.");
        }

        const categoriaExistente = this.categoriaRepository.buscarPorPropiedades("nombre", datos.nombre.trim());

        if (categoriaExistente) {
            throw new BadRequestError("Ya existe una categoría con ese nombre.");
        }
        
        return await this.categoriaRepository.actualizar({ ...categoria, nombre: datos.nombre.trim() });
    };

    actualizarProductosCategoria = async (id, datos) => {
        const categoria = await this.categoriaRepository.buscarPorId(Number(id));

        if (!categoria) {
            throw new NotFoundError("No se encontró la categoría.");
        }

        const productos = [...categoria.productos, ...datos.productos];

        return await this.categoriaRepository.actualizar({
            ...categoria,
            productos
        });

    };

    eliminarCategoria = async (id) => {
        const categoria = await this.categoriaRepository.buscarPorId(Number(id));

        if (!categoria) {
            throw new NotFoundError("No se encontró la categoría.");
        }

        await this.categoriaRepository.eliminar(Number(id));
    };
}
