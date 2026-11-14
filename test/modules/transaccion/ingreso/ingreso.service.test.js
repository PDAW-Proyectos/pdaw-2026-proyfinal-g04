import { jest } from "@jest/globals";
import { IngresoService } from "../../../../src/modules/transaccion/ingreso/ingreso.service";
import { NotFoundError, BadRequestError } from "../../../../src/common/errors/errors.classes.js";

describe("IngresoService", () => {
    let transaccionRepository;
    let productoRepository;
    let productoService;
    let service;

    beforeEach(() => {
        jest.clearAllMocks();

        transaccionRepository = {
            listar: jest.fn(),
            listarPorPropiedades: jest.fn(),
            buscarPorId: jest.fn(),
            crear: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn()
        };

        productoRepository = {
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn()
        };

        productoService = {
            productoRepository,
            disminuirStock: jest.fn()
        };

        service = new IngresoService(transaccionRepository, productoService);
    });

    describe("listarIngresos", () => {
        it("retorna los ingresos mapeados y la paginación correctamente", () => {
            const mockResultadoRepo = {
                datos: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            };
            transaccionRepository.listar.mockReturnValue(mockResultadoRepo);

            const resultado = service.listarIngresos(1, 10);

            expect(transaccionRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                ingresos: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("filtrarIngresos", () => {
        it("retorna los ingresos filtrados mapeados y la paginación correctamente", () => {
            const filtros = { metodoDePago: "efectivo" };
            const mockResultadoRepo = {
                datos: [{ id: 1, metodoDePago: "efectivo" }],
                total: 1,
                pagina: 1,
                limite: 10
            };
            transaccionRepository.listarPorPropiedades.mockReturnValue(mockResultadoRepo);

            const resultado = service.filtrarIngresos(filtros, 1, 10);

            expect(transaccionRepository.listarPorPropiedades).toHaveBeenCalledWith(filtros, 1, 10);
            expect(resultado).toEqual({
                ingresos: [{ id: 1, metodoDePago: "efectivo" }],
                total: 1,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("buscarIngreso", () => {
        it("retorna el ingreso si es encontrado", () => {
            const ingresoMock = { id: 1, monto: 100 };
            transaccionRepository.buscarPorId.mockReturnValue(ingresoMock);

            const resultado = service.buscarIngreso(1);

            expect(transaccionRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(ingresoMock);
        });

        it("arroja NotFoundError si el ingreso no existe", () => {
            transaccionRepository.buscarPorId.mockReturnValue(null);

            expect(() => service.buscarIngreso(99)).toThrow(NotFoundError);
            expect(() => service.buscarIngreso(99)).toThrow("Ingreso");
        });
    });

    describe("crearIngreso", () => {
        it("crea y retorna el ingreso exitosamente si el monto es mayor o igual a cero", async () => {
            const datos = { monto: 150, metodoDePago: "efectivo" };
            const ingresoCreado = { id: 1, ...datos };
            transaccionRepository.crear.mockResolvedValue(ingresoCreado);

            const resultado = await service.crearIngreso(datos);

            expect(transaccionRepository.crear).toHaveBeenCalledWith(datos);
            expect(resultado).toEqual(ingresoCreado);
        });

        it("arroja BadRequestError si el monto es menor a cero (negativo)", async () => {
            const datos = { monto: -10 };

            await expect(service.crearIngreso(datos)).rejects.toThrow(BadRequestError);
            await expect(service.crearIngreso(datos)).rejects.toThrow("El monto debe ser mayor o igual a cero para un ingreso");
            expect(transaccionRepository.crear).not.toHaveBeenCalled();
        });
    });

    describe("crearVenta", () => {
        const idUsuario = 1;
        const datosVentaValidos = {
            idCaja: 5,
            metodoDePago: "efectivo",
            monto: 500,
            articulos: [
                { id: 10, unidad: 2 }
            ]
        };

        it("crea una venta exitosamente disminuyendo stock y administrando transacciones", async () => {
            productoService.disminuirStock.mockResolvedValue({ id: 10, nombre: "Prod A" });
            const ventaMock = { id: 100, monto: 500 };
            transaccionRepository.crear.mockResolvedValue(ventaMock);

            const resultado = await service.crearVenta(idUsuario, datosVentaValidos);

            expect(transaccionRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(productoRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(productoService.disminuirStock).toHaveBeenCalledWith(10, 2);
            expect(transaccionRepository.crear).toHaveBeenCalledWith({
                idUsuario,
                idCaja: 5,
                metodoDePago: "efectivo",
                articulos: [
                    { id: 10, cantidad: 2 }
                ],
                monto: 500
            });
            expect(transaccionRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(productoRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(resultado).toEqual({
                ...ventaMock,
                articulos: [
                    { id: 10, nombre: "Prod A", cantidad: 2 }
                ]
            });
        });

        it("arroja BadRequestError si datos.articulos no es un array", async () => {
            await expect(service.crearVenta(idUsuario, { articulos: "no-array" })).rejects.toThrow(BadRequestError);
            await expect(service.crearVenta(idUsuario, { articulos: "no-array" })).rejects.toThrow("La lista de artículos debe ser un array");
        });

        it("ejecuta rollback en los repositorios si ocurre un error durante crearVenta", async () => {
            productoService.disminuirStock.mockRejectedValue(new Error("Stock insuficiente"));

            await expect(service.crearVenta(idUsuario, datosVentaValidos)).rejects.toThrow("Stock insuficiente");

            expect(transaccionRepository.rollback).toHaveBeenCalled();
            expect(productoRepository.rollback).toHaveBeenCalled();
        });

        it("no administra transacciones si administrarTransacciones es false", async () => {
            productoService.disminuirStock.mockResolvedValue({ id: 10, unidad: 2 });
            transaccionRepository.crear.mockResolvedValue({ id: 100 });

            await service.crearVenta(idUsuario, datosVentaValidos, { administrarTransacciones: false });

            expect(transaccionRepository.iniciarTransaccion).not.toHaveBeenCalled();
            expect(transaccionRepository.confirmarTransaccion).not.toHaveBeenCalled();
        });
    });

    describe("actualizarIngreso", () => {
        it("actualiza el ingreso correctamente si existe y el monto es mayor o igual a cero", async () => {
            const ingresoAnterior = { id: 1, monto: 100, metodoDePago: "efectivo" };
            const datosNuevos = { monto: 150 };
            transaccionRepository.buscarPorId.mockReturnValue(ingresoAnterior);
            transaccionRepository.actualizar.mockResolvedValue({ ...ingresoAnterior, ...datosNuevos });

            const resultado = await service.actualizarIngreso(1, datosNuevos);

            expect(transaccionRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(transaccionRepository.actualizar).toHaveBeenCalledWith({ id: 1, monto: 150, metodoDePago: "efectivo" });
            expect(resultado.monto).toBe(150);
        });

        it("arroja NotFoundError si el ingreso a actualizar no existe", async () => {
            transaccionRepository.buscarPorId.mockReturnValue(null);

            await expect(service.actualizarIngreso(1, { monto: 50 })).rejects.toThrow(NotFoundError);
            await expect(service.actualizarIngreso(1, { monto: 50 })).rejects.toThrow("Ingreso");
        });

        it("arroja BadRequestError si el monto actualizado es menor a cero", async () => {
            const ingresoAnterior = { id: 1, monto: 100 };
            transaccionRepository.buscarPorId.mockReturnValue(ingresoAnterior);

            await expect(service.actualizarIngreso(1, { monto: -10 })).rejects.toThrow(BadRequestError);
            await expect(service.actualizarIngreso(1, { monto: -10 })).rejects.toThrow("El monto debe ser mayor o igual a cero para un ingreso");
        });
    });

    describe("eliminarIngreso", () => {
        it("elimina el ingreso exitosamente si existe", async () => {
            const ingresoEliminado = { id: 1 };
            transaccionRepository.eliminar.mockResolvedValue(ingresoEliminado);

            const resultado = await service.eliminarIngreso(1);

            expect(transaccionRepository.eliminar).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(ingresoEliminado);
        });

        it("arroja NotFoundError si el ingreso a eliminar no existe", async () => {
            transaccionRepository.eliminar.mockResolvedValue(null);

            await expect(service.eliminarIngreso(99)).rejects.toThrow(NotFoundError);
            await expect(service.eliminarIngreso(99)).rejects.toThrow("Ingreso");
        });
    });
});