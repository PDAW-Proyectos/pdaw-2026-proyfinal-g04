import { Egreso } from "./modules/Transaccion/Egreso/egreso.entity.js";
import { Ingreso } from "./modules/Transaccion/Ingreso/ingreso.entity.js";
import { Insumo } from "./modules/Insumo/insumo.entity.js";
import { Producto } from "./modules/Producto/producto.entity.js";
import { ProductoPeso } from "./modules/Producto/productoPeso.entity.js";
import { ProductoUnidad } from "./modules/Producto/productoUnidad.entity.js";
import { Usuario } from "./modules/Usuario/usuario.entity.js";

const CLASES = { 
    Usuario: Usuario,
    Ingreso: Ingreso, Egreso: Egreso,
    //  caja: Caja
    Producto: Producto,
    ProductoPeso: ProductoPeso,
    ProductoUnidad: ProductoUnidad,
    Insumo: Insumo
};

export class Factory {
    crear(entidad) {
        const clase = CLASES[entidad.tipo];
        if (!clase) throw new TypeError(`Tipo desconocido: ${entidad.tipo}`);
        return new clase({ ...entidad });
    }
}