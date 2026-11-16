import { solicitarJson } from "../../common/api/httpClient.js";
import { redondearPrecio } from "../../common/utils/formato.js";

export function crearArticulosApi(base = "/api") {
    async function listarTodos(ruta, clave) {
        const elementos = [];
        let pagina = 1;

        let totalPaginas;
        while (pagina === 1 || pagina <= totalPaginas) {
            const resultado = await solicitarJson(`${base}/${ruta}?pagina=${pagina}&limite=50`);

            if (!Array.isArray(resultado?.[clave])) {
                throw new Error(`El backend devolvió una lista inválida para ${ruta}`);
            }

            elementos.push(...resultado[clave]);
            totalPaginas = resultado.totalPaginas ?? pagina;
            pagina += 1;
        }

        return elementos;
    }

    function mapearProducto(producto, categorias = new Map()) {
        const cotizacion = Number(producto.cotizacion);
        if (typeof producto.precioUsd !== "number" || !Number.isFinite(producto.precioUsd) || producto.precioUsd < 0) {
            throw new Error(`El producto ${producto.id} no tiene un precio USD válido`);
        }
        if (!Number.isFinite(cotizacion) || cotizacion <= 0) {
            throw new Error(`El producto ${producto.id} no tiene una cotización válida`);
        }

        return {
            ...producto,
            categoria: categorias.get(String(producto.idCategoria)) ?? producto.categoria ?? "General",
            precio: producto.precio ?? redondearPrecio(producto.precioUsd * cotizacion),
            stock: Number(producto.unidad ?? producto.peso ?? 0),
        };
    }

    return {
        async listarProductos() {
            const [productos, respuestaCategorias] = await Promise.all([
                listarTodos("productos/", "productos"),
                solicitarJson(`${base}/categorias/?pagina=1&limite=50`),
            ]);
            const categorias = respuestaCategorias?.categorias;

            if (!Array.isArray(categorias)) {
                throw new Error("El backend devolvió una lista inválida para categorías");
            }

            const categoriasPorId = new Map(categorias.map(({ id, nombre }) => [String(id), nombre]));
            return productos.map((producto) => mapearProducto(producto, categoriasPorId));
        },

        listarProveedores() {
            return listarTodos("proveedores/", "proveedores");
        },

        async cargarUmbralesStock() {
            const { stock } = await solicitarJson(`${base}/configuracion/stock`);

            if (!Number.isInteger(stock?.critico) || !Number.isInteger(stock?.medio) || stock.critico < 0 || stock.medio <= stock.critico) {
                throw new Error("El backend devolvió umbrales de stock inválidos");
            }

            return stock;
        },

        async actualizarProducto(producto, cambios) {
            const campoStock = producto.unidad !== undefined ? "unidad" : "peso";
            const actualizado = await solicitarJson(`${base}/productos/${producto.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    [campoStock]: cambios.stock,
                    descripcion: cambios.descripcion,
                }),
            });

            return {
                ...producto,
                ...actualizado,
                categoria: producto.categoria,
                precio: producto.precio,
                stock: Number(actualizado[campoStock] ?? cambios.stock),
            };
        },
    };
}
