import { jest } from '@jest/globals';
import bcrypt from "bcrypt";
import { AuthService } from "../../../src/modules/auth/auth.service.js";
import { ConflictError, ForbiddenError, UnauthorizedError } from "../../../src/common/errors/errors.classes.js";

describe("AuthService", () => {
    let mockUserService;
    let authService;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        mockUserService = {
            buscarUsuarioPorEmail: jest.fn(),
            crearUsuario: jest.fn()
        };
        authService = new AuthService(mockUserService);
    });

    describe("signup", () => {
        const datosRegistro = {
            nombre: "Juan",
            apellido: "Pérez",
            email: "juan@test.com",
            password: "password123",
            rol: "cajero"
        };

        test("registra un usuario correctamente si el email no existe y hashea la contraseña", async () => {
            const hashSpy = jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed_password_123");
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(null);
            mockUserService.crearUsuario.mockResolvedValue({ id: 1, ...datosRegistro });

            const resultado = await authService.signup(datosRegistro);

            expect(mockUserService.buscarUsuarioPorEmail).toHaveBeenCalledWith("juan@test.com");
            expect(hashSpy).toHaveBeenCalledWith("password123", 12);
            expect(mockUserService.crearUsuario).toHaveBeenCalledWith({
                nombre: "Juan",
                apellido: "Pérez",
                email: "juan@test.com",
                contraseña: "hashed_password_123",
                rol: "cajero"
            });
            expect(resultado).toHaveProperty("id", 1);
        });

        test("arroja ConflictError si el email ya está en uso", async () => {
            const hashSpy = jest.spyOn(bcrypt, "hash");
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue({ email: "juan@test.com" });

            await expect(authService.signup(datosRegistro)).rejects.toThrow(ConflictError);
            await expect(authService.signup(datosRegistro)).rejects.toThrow("El email ya está en uso");
            
            expect(hashSpy).not.toHaveBeenCalled();
            expect(mockUserService.crearUsuario).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        const credenciales = { email: "juan@test.com", password: "password123" };
        const mockCajeroDB = {
            idUsuario: 1,
            nombre: "Juan",
            email: "juan@test.com",
            contraseña: "hashed_password",
            rol: "cajero"
        };

        test("inicia sesión correctamente con credenciales válidas", async () => {
            const compareSpy = jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(mockCajeroDB);

            const resultado = await authService.login(credenciales);

            expect(mockUserService.buscarUsuarioPorEmail).toHaveBeenCalledWith("juan@test.com");
            expect(compareSpy).toHaveBeenCalledWith("password123", "hashed_password");
            expect(resultado).toEqual({
                idUsuario: 1,
                nombre: "Juan",
                email: "juan@test.com",
                rol: "cajero",
                mensaje: "Inicio de sesión exitoso"
            });
        });

        test("arroja UnauthorizedError si el usuario no existe", async () => {
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(null);
            await expect(authService.login(credenciales)).rejects.toThrow(UnauthorizedError);
            await expect(authService.login(credenciales)).rejects.toThrow("Email o contraseña incorrectos");
        });

        test("arroja UnauthorizedError si la contraseña es incorrecta", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(mockCajeroDB);
            await expect(authService.login(credenciales)).rejects.toThrow(UnauthorizedError);
        });

        test("permite el acceso si requestedRole coincide con el rol del usuario", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(mockCajeroDB);

            const resultado = await authService.login({ ...credenciales, requestedRole: "cajero" });
            
            expect(resultado.rol).toBe("cajero");
        });

        test("permite el acceso si requestedRole es diferente pero el usuario es 'admin'", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            const adminDB = { ...mockCajeroDB, rol: "admin" };
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(adminDB);

            const resultado = await authService.login({ ...credenciales, requestedRole: "cajero" });
            
            expect(resultado.rol).toBe("admin");
        });

        test("arroja ForbiddenError si requestedRole no coincide y el usuario no es admin", async () => {
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(mockCajeroDB);
            await expect(authService.login({ ...credenciales, requestedRole: "admin" })).rejects.toThrow(ForbiddenError);
            await expect(authService.login({ ...credenciales, requestedRole: "admin" })).rejects.toThrow("No tenés permisos para ingresar a esta área");
        });

        test("maneja correctamente las propiedades alternativas (role, password, id)", async () => {
            const compareSpy = jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
            const usuarioDBAlternativo = {
                id: 99,
                nombre: "Pepe",
                email: "pepe@test.com",
                password: "pass",
                role: "repositor"
            };
            mockUserService.buscarUsuarioPorEmail.mockResolvedValue(usuarioDBAlternativo);

            const resultado = await authService.login({ email: "pepe@test.com", password: "123" });

            expect(compareSpy).toHaveBeenCalledWith("123", "pass");
            expect(resultado.idUsuario).toBe(99);
            expect(resultado.rol).toBe("repositor");
        });
    });

    describe("logout", () => {
        test("destruye la sesión exitosamente", async () => {
            const mockSession = {
                destroy: jest.fn((callback) => {
                    callback(null);
                })
            };
            await expect(authService.logout(mockSession)).resolves.toBeUndefined();
            expect(mockSession.destroy).toHaveBeenCalled();
        });

        test("rechaza la promesa si ocurre un error al destruir la sesión", async () => {
            const errorDeSesion = new Error("Fallo al destruir la sesión");
            const mockSession = {
                destroy: jest.fn((callback) => {
                    callback(errorDeSesion);
                })
            };
            await expect(authService.logout(mockSession)).rejects.toThrow(errorDeSesion);
            expect(mockSession.destroy).toHaveBeenCalled();
        });
    });
});