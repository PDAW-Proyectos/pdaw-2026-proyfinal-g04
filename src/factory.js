const CLASES = { usuario: Usuario, caja: Caja, ingreso: Ingreso, egreso: Egreso, producto: Producto, insumo: Insumo };

export class Factory {
    crear(entidad) {
        const clase = CLASES[entidad.tipo];
        if (!clase) throw new TypeError(`Tipo desconocido: ${entidad.tipo}`);
        return new clase({ ...entidad });
    }
}