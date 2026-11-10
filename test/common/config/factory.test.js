import { Factory } from "../../../src/common/config/factory.js";
import { Usuario } from "../../../src/modules/Usuario/usuario.entity.js";
import { ProductoUnidad } from "../../../src/modules/Producto/productoUnidad.entity.js";
import { ProductoPeso } from "../../../src/modules/Producto/productoPeso.entity.js";
import { Insumo } from "../../../src/modules/Insumo/insumo.entity.js";
import { Ingreso } from "../../../src/modules/Transaccion/Ingreso/ingreso.entity.js";
import { Egreso } from "../../../src/modules/Transaccion/Egreso/egreso.entity.js";

describe("factory", () => {
    let factory;
    beforeEach(() => {
        factory = new Factory();
    });

    test("crearUsuario devuelve un objeto de tipo Usuario", async () => {
        const usuario = factory.crearUsuario({ nombre: "Juan", email: "juan@gmail.com", contraseña: "hola123", rol: "admin" });
        expect(usuario).toBeInstanceOf(Usuario);
    });

    test("crearProducto devuelve un objeto de tipo ProductoUnidad al pasarle la unidad", async () => {
        const producto = factory.crearProducto({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precio: 100, unidad: 10 });
        expect(producto).toBeInstanceOf(ProductoUnidad);
    });

    test("crearProducto devuelve un objeto de tipo ProductoPeso al pasarle el peso", async () => {
        const producto = factory.crearProducto({ id: 1, nombre: "Yerba", categoria: "Hierbas", descripcion: "Yerba playadito", precio: 100, peso: 1000, unidadMedida: "g" });
        expect(producto).toBeInstanceOf(ProductoPeso);
    });

    test("crearInsumo devuelve un objeto de tipo Insumo", async () => {
        const insumo = factory.crearInsumo({ id: 1, nombre: "Trapo de piso", categoria: "Limpieza", descripcion: "Trapo de piso de algodón", unidad: 10, uso: "Limpieza" });
        expect(insumo).toBeInstanceOf(Insumo);
    });

    test("crearTransaccion devuelve un objeto de tipo Ingreso al pasar por parametro un monto mayor a 0", async () => {
        const ingreso = factory.crearTransaccion({ id: 1, monto: 10000, idUsuario: 1, fecha: "01/14/2005", metodoDePago: "Efectivo", articulos: [] });
        expect(ingreso).toBeInstanceOf(Ingreso);
    });

    test("crearTransaccion devuelve un objeto de tipo Egreso al pasar por parametro un monto menor o igual a 0", async () => {
        const egreso = factory.crearTransaccion({ id: 1, monto: 0, idUsuario: 1, fecha: "01/14/2005", metodoDePago: "Efectivo", articulos: [] });
        expect(egreso).toBeInstanceOf(Egreso);
    });
});
