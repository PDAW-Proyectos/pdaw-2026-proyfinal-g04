import { Usuario } from "../../../src/modules/usuario/usuario.entity.js";

describe("Usuario", () => {
    it("al crear una instancia de usuario sin email o email vacio devuelve una excepcion", async () => {
        expect(() => {new Usuario({ id: 1, contraseña: 123456, nombre: "Juan", apellido: "Perez", rol: "admin", habilitado: true })}).toThrow("Email vacio");
        expect(() => {new Usuario({ id: 1, email: "", contraseña: 123456, nombre: "Juan", apellido: "Perez", rol: "admin", habilitado: true })}).toThrow("Email vacio");
    });

    it("al crear una instancia de usuario sin contraseña o contraseña vacio devuelve una excepcion", async () => {
        expect(() => {new Usuario({ id: 1, email: "juan@gmail.com", nombre: "Juan", apellido: "Perez", rol: "admin", habilitado: true })}).toThrow("Contraseña vacia");
        expect(() => {new Usuario({ id: 1, email: "juan@gmail.com", contraseña: "", nombre: "Juan", apellido: "Perez", rol: "admin", habilitado: true })}).toThrow("Contraseña vacia");
    });

    it("al crear una instancia de producto con todos los parametros correctos devuelve una instancia de Insumo", async () => {
        const usuario = new Usuario({ id: 1, email: "juan@gmail.com", contraseña: 123456, nombre: "Juan", apellido: "Perez", rol: "admin", habilitado: true });
        expect(usuario).toBeInstanceOf(Usuario);
        expect(usuario).toEqual({ 
            id: 1, 
            email: "juan@gmail.com", 
            contraseña: 123456, 
            nombre: "Juan", 
            apellido: "Perez", 
            rol: "admin", 
            habilitado: true 
        });
    });
});