import { Usuario } from "../../modules/Usuario/usuario.entity.js";
import { ProductoPeso } from "../../modules/Producto/productoPeso.entity.js";
import { ProductoUnidad } from "../../modules/Producto/productoUnidad.entity.js";
import { Insumo } from "../../modules/Insumo/insumo.entity.js";
import { Ingreso } from "../../modules/Transaccion/Ingreso/ingreso.entity.js";
import { Egreso } from "../../modules/Transaccion/Egreso/egreso.entity.js";

export class Factory {
    crearUsuario(entidad) {
        return new Usuario(entidad);
    }

    crearProducto(entidad) {
        const producto = entidad.unidad ? new ProductoUnidad(entidad) : new ProductoPeso(entidad);
        return producto;
    }

    crearInsumo(entidad) {
        return new Insumo(entidad);
    }

    crearTransaccion(entidad) {
        const transaccion = entidad.monto > 0 ? new Ingreso(entidad) : new Egreso(entidad);
        return transaccion;
    }
}