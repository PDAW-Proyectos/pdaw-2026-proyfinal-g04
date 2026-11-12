import { Usuario } from "../../modules/usuario/usuario.entity.js";
import { ProductoPeso } from "../../modules/producto/productoPeso.entity.js";
import { ProductoUnidad } from "../../modules/producto/productoUnidad.entity.js";
import { Insumo } from "../../modules/insumo/insumo.entity.js";
import { Ingreso } from "../../modules/transaccion/ingreso/ingreso.entity.js";
import { Egreso } from "../../modules/transaccion/egreso/egreso.entity.js";
import { Cotizacion } from "../../modules/cotizacion/cotizacion.entity.js";
import { Caja } from "../../modules/caja/caja.entity.js";

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

    crearCotizacion(entidad) {
        return new Cotizacion(entidad)
    }

    crearCaja(entidad) {
        return new Caja(entidad)
    }

    // Sin uso aun
    crearConfiguracion(entidad) {
        return entidad
    }
}