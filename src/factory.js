import { Insumo } from "./modules/Articulo/Insumo/insumo.entity.js";
import { Producto } from "./modules/Articulo/Producto/producto.entity.js";
import { Egreso } from "./modules/Transaccion/Egreso/egreso.entity.js";
import { Ingreso } from "./modules/Transaccion/Ingreso/ingreso.entity.js";
import { Usuario } from "./modules/Usuario/usuario.entity.js";

const CLASES = { 
    Usuario: Usuario,
    //  caja: Caja, 
    Ingreso: Ingreso, Egreso: Egreso,
    Producto: Producto, Insumo: Insumo 
    };

export class Factory {
    crear(entidad) {
        const clase = CLASES[entidad.tipo];
        if (!clase) throw new TypeError(`Tipo desconocido: ${entidad.tipo}`);
        return new clase({ ...entidad });
    }
}