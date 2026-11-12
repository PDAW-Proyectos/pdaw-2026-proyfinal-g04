import { jest } from '@jest/globals';
import { UserService } from "../../../src/modules/usuario/usuario.service.js"; 
import { NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe('UserService', () => {
    let userService;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            listar: jest.fn(),
            listarPorPropiedades: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorPropiedades: jest.fn(),
            crear: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
        };
        userService = new UserService(mockUserRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarUsuarios()', () => {
        it('debe listar usuarios transformando "datos" en "usuarios"', () => {
            const pagina = 1;
            const limite = 10;
            const datosFalsos = [{ id: 1, nombre: 'Juan Doe' }];
            mockUserRepository.listar.mockReturnValue({
                datos: datosFalsos,
                total: 1,
                pagina,
                limite
            });

            const resultado = userService.listarUsuarios(pagina, limite);

            expect(mockUserRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                usuarios: datosFalsos,
                total: 1,
                pagina,
                limite
            });
        });
    });

    describe('filtrarUsuarios()', () => {
        it('debe filtrar usuarios y mapear la respuesta correctamente', () => {
            const filtros = { nombre: 'Juan' };
            const pagina = 1;
            const limite = 10;
            const datosFalsos = [{ id: 1, nombre: 'Juan Doe' }];
            mockUserRepository.listarPorPropiedades.mockReturnValue({
                datos: datosFalsos,
                total: 1,
                pagina,
                limite
            });

            const resultado = userService.filtrarUsuarios(filtros, pagina, limite);

            expect(mockUserRepository.listarPorPropiedades).toHaveBeenCalledWith(filtros, 1, 10);
            expect(resultado).toEqual({
                usuarios: datosFalsos,
                total: 1,
                pagina,
                limite
            });
        });
    });

    describe('buscarUsuario()', () => {
        it('debe retornar el usuario si existe', () => {
            const usuarioMock = { id: 1, nombre: 'Juan Doe' };
            mockUserRepository.buscarPorId.mockReturnValue(usuarioMock);

            const resultado = userService.buscarUsuario(1);

            expect(mockUserRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(usuarioMock);
        });

        it('debe lanzar NotFoundError si el usuario no existe', () => {
            mockUserRepository.buscarPorId.mockReturnValue(null);
            expect(() => userService.buscarUsuario(99)).toThrow(NotFoundError);
            expect(() => userService.buscarUsuario(99)).toThrow("Usuario");
        });
    });

    describe('buscarUsuarioPorEmail()', () => {
        it('debe retornar el usuario buscado por email', () => {
            const emailMock = 'juan@ejemplo.com';
            const usuarioMock = { id: 1, email: emailMock, nombre: 'Juan' };
            mockUserRepository.buscarPorPropiedades.mockReturnValue(usuarioMock);

            const resultado = userService.buscarUsuarioPorEmail(emailMock);

            expect(mockUserRepository.buscarPorPropiedades).toHaveBeenCalledWith({ email: emailMock });
            expect(resultado).toEqual(usuarioMock);
        });
    });

    describe('crearUsuario()', () => {
        it('debe crear un usuario a través del repositorio', async () => {
            const datosMock = { nombre: 'Pedro', email: 'pedro@ejemplo.com' };
            const creadoMock = { id: 2, ...datosMock };
            mockUserRepository.crear.mockResolvedValue(creadoMock);

            const resultado = await userService.crearUsuario(datosMock);

            expect(mockUserRepository.crear).toHaveBeenCalledWith(datosMock);
            expect(resultado).toEqual(creadoMock);
        });
    });

    describe('actualizarUsuario()', () => {
        it('debe actualizar fusionando los datos anteriores con los nuevos', async () => {
            const id = 1;
            const datosNuevos = { rol: 'admin' };
            const usuarioAnterior = { id: 1, nombre: 'Juan', rol: 'USER' };
            mockUserRepository.buscarPorId.mockReturnValue(usuarioAnterior);
            mockUserRepository.actualizar.mockResolvedValue({ ...usuarioAnterior, ...datosNuevos });

            const resultado = await userService.actualizarUsuario(id, datosNuevos);

            expect(mockUserRepository.buscarPorId).toHaveBeenCalledWith(id);
            expect(mockUserRepository.actualizar).toHaveBeenCalledWith({
                id: 1, 
                nombre: 'Juan', 
                rol: 'admin'
            });
            expect(resultado.rol).toBe('admin');
        });

        it('debe lanzar NotFoundError si el usuario a actualizar no existe', async () => {
            mockUserRepository.buscarPorId.mockReturnValue(null);
            await expect(userService.actualizarUsuario(99, { nombre: 'test' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('eliminarUsuario()', () => {
        it('debe eliminar el usuario y retornar el resultado', async () => {
            const eliminadoMock = { id: 1, nombre: 'Juan Doe' };
            mockUserRepository.eliminar.mockResolvedValue(eliminadoMock);

            const resultado = await userService.eliminarUsuario(1);

            expect(mockUserRepository.eliminar).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(eliminadoMock);
        });

        it('debe lanzar NotFoundError si el usuario no fue encontrado para eliminar', async () => {
            mockUserRepository.eliminar.mockResolvedValue(null);
            await expect(userService.eliminarUsuario(99)).rejects.toThrow(NotFoundError);
        });
    });
});