import { jest } from "@jest/globals";
import { EgresoService } from "../../../../src/modules/transaccion/egreso/egreso.service.js";
import { BadRequestError, NotFoundError } from "../../../../src/common/errors/errors.classes.js";

describe("EgresoService", () => {
    let transaccionRepository;
    let productoRepository;
    let insumoRepository;
    let productoService;
    let insumoService;
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

        insumoRepository = {
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn()
        };

        productoService = {
            productoRepository,
            aumentarStock: jest.fn(),
            crearProducto: jest.fn()
        };

        insumoService = {
            insumoRepository,
            aumentarStock: jest.fn(),
            crearInsumo: jest.fn()
        };

        service = new EgresoService(transaccionRepository, productoService, insumoService);
    });

    describe("listarEgresos", () => {
        it("retorna los egresos mapeados y la paginación correctamente", () => {
            const mockResultadoRepo = {
                datos: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            };
            transaccionRepository.listar.mockReturnValue(mockResultadoRepo);

            const resultado = service.listarEgresos(1, 10);

            expect(transaccionRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                egresos: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("filtrarEgresos", () => {
        it("retorna los egresos filtrados mapeados y la paginación correctamente", () => {
            const filtros = { metodoDePago: "efectivo" };
            const mockResultadoRepo = {
                datos: [{ id: 1, metodoDePago: "efectivo" }],
                total: 1,
                pagina: 1,
                limite: 10
            };
            transaccionRepository.listarPorPropiedades.mockReturnValue(mockResultadoRepo);

            const resultado = service.filtrarEgresos(filtros, 1, 10);

            expect(transaccionRepository.listarPorPropiedades).toHaveBeenCalledWith(filtros, 1, 10);
            expect(resultado).toEqual({
                egresos: [{ id: 1, metodoDePago: "efectivo" }],
                total: 1,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("buscarEgreso", () => {
        it("retorna el egreso si es encontrado", () => {
            const egresoMock = { id: 1, monto: -100 };
            transaccionRepository.buscarPorId.mockReturnValue(egresoMock);

            const resultado = service.buscarEgreso(1);

            expect(transaccionRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(egresoMock);
        });

        it("arroja NotFoundError si el egreso no existe", () => {
            transaccionRepository.buscarPorId.mockReturnValue(null);

            expect(() => service.buscarEgreso(99)).toThrow(NotFoundError);
            expect(() => service.buscarEgreso(99)).toThrow("Egreso");
        });
    });

    describe("crearEgreso", () => {
        it("crea y retorna el egreso exitosamente si el monto es menor o igual a cero", async () => {
            const datos = { monto: -150, metodoDePago: "efectivo" };
            const egresoCreado = { id: 1, ...datos };
            transaccionRepository.crear.mockResolvedValue(egresoCreado);

            const resultado = await service.crearEgreso(datos);

            expect(transaccionRepository.crear).toHaveBeenCalledWith(datos);
            expect(resultado).toEqual(egresoCreado);
        });

        it("arroja BadRequestError si el monto es mayor a cero", async () => {
            const datos = { monto: 100 };

            await expect(service.crearEgreso(datos)).rejects.toThrow(BadRequestError);
            await expect(service.crearEgreso(datos)).rejects.toThrow("El monto debe ser menor o igual a cero para un egreso");
            expect(transaccionRepository.crear).not.toHaveBeenCalled();
        });
    });

    describe("crearCompra", () => {
        const idUsuario = 1;
        const datosCompraValidos = {
            idCaja: 5,
            metodoDePago: "efectivo",
            monto: -500,
            articulos: [
                { tipo: "producto", id: 10, unidad: 2 },
                { tipo: "insumo", id: 20, unidad: 5 }
            ]
        };

        it("crea una compra exitosamente con artículos existentes y administra transacciones", async () => {
            productoService.aumentarStock.mockResolvedValue({ id: 10, tipo: "producto", unidad: 2, nombre: "Prod A" });
            insumoService.aumentarStock.mockResolvedValue({ id: 20, tipo: "insumo", unidad: 5, nombre: "Insumo B" });
            const egresoMock = { id: 100, monto: -500 };
            transaccionRepository.crear.mockResolvedValue(egresoMock);

            const resultado = await service.crearCompra(idUsuario, datosCompraValidos);

            expect(transaccionRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(productoRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(insumoRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(productoService.aumentarStock).toHaveBeenCalledWith(10, 2);
            expect(insumoService.aumentarStock).toHaveBeenCalledWith(20, 5);
            expect(transaccionRepository.crear).toHaveBeenCalledWith({
                idUsuario,
                idCaja: 5,
                metodoDePago: "efectivo",
                articulos: [
                    { id: 10, cantidad: 2, tipo: "producto" },
                    { id: 20, cantidad: 5, tipo: "insumo" }
                ],
                monto: -500
            });
            expect(transaccionRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(productoRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(insumoRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(resultado).toEqual({
                ...egresoMock,
                articulos: [
                    { cantidad: 2, id: 10, nombre: "Prod A", tipo: "producto", unidad: 2 },
                    { cantidad: 5, id: 20, nombre: "Insumo B", tipo: "insumo", unidad: 5 }
                ]
            });
        });

        it("crea una compra creando nuevos productos o insumos si no tienen id", async () => {
            const datosNuevos = {
                idCaja: 1,
                metodoDePago: "efectivo",
                monto: -300,
                articulos: [
                    { tipo: "producto", nombre: "Nuevo Prod", peso: 1 },
                    { tipo: "insumo", nombre: "Nuevo Insumo", unidad: 3 }
                ]
            };
            productoService.crearProducto.mockResolvedValue({ id: 15, nombre: "Nuevo Prod" });
            insumoService.crearInsumo.mockResolvedValue({ id: 25, nombre: "Nuevo Insumo" });
            transaccionRepository.crear.mockResolvedValue({ id: 101, monto: -300 });

            await service.crearCompra(idUsuario, datosNuevos);

            expect(productoService.crearProducto).toHaveBeenCalledWith(datosNuevos.articulos[0]);
            expect(insumoService.crearInsumo).toHaveBeenCalledWith(datosNuevos.articulos[1]);
        });

        it("arroja BadRequestError si datos.articulos no es un array", async () => {
            await expect(service.crearCompra(idUsuario, { articulos: "no-array" })).rejects.toThrow(BadRequestError);
            await expect(service.crearCompra(idUsuario, { articulos: "no-array" })).rejects.toThrow("La lista de artículos debe ser un array");
        });

        it("arroja BadRequestError si el tipo de artículo es inválido", async () => {
            const datosInvalidos = {
                articulos: [{ tipo: "desconocido", id: 1 }]
            };

            await expect(service.crearCompra(idUsuario, datosInvalidos)).rejects.toThrow(BadRequestError);
            await expect(service.crearCompra(idUsuario, datosInvalidos)).rejects.toThrow("Tipo de artículo inválido: desconocido");
        });

        it("ejecuta rollback en los repositorios si ocurre un error durante crearCompra", async () => {
            productoService.aumentarStock.mockRejectedValue(new Error("Error stock"));

            await expect(service.crearCompra(idUsuario, datosCompraValidos)).rejects.toThrow("Error stock");

            expect(transaccionRepository.rollback).toHaveBeenCalled();
            expect(productoRepository.rollback).toHaveBeenCalled();
            expect(insumoRepository.rollback).toHaveBeenCalled();
        });

        it("no administra transacciones si administrarTransacciones es false", async () => {
            productoService.aumentarStock.mockResolvedValue({ id: 10 });
            transaccionRepository.crear.mockResolvedValue({ id: 100 });

            await service.crearCompra(idUsuario, datosCompraValidos, { administrarTransacciones: false });

            expect(transaccionRepository.iniciarTransaccion).not.toHaveBeenCalled();
            expect(transaccionRepository.confirmarTransaccion).not.toHaveBeenCalled();
        });
    });

    describe("actualizarEgreso", () => {
        it("actualiza el egreso correctamente si existe y el monto es menor o igual a cero", async () => {
            const egresoAnterior = { id: 1, monto: -100, metodoDePago: "efectivo" };
            const datosNuevos = { monto: -150 };
            transaccionRepository.buscarPorId.mockResolvedValue(egresoAnterior);
            transaccionRepository.actualizar.mockResolvedValue({ ...egresoAnterior, ...datosNuevos });

            const resultado = await service.actualizarEgreso(1, datosNuevos);

            expect(transaccionRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(transaccionRepository.actualizar).toHaveBeenCalledWith({ id: 1, monto: -150, metodoDePago: "efectivo" });
            expect(resultado.monto).toBe(-150);
        });

        it("arroja NotFoundError si el egreso a actualizar no existe", async () => {
            transaccionRepository.buscarPorId.mockResolvedValue(null);

            await expect(service.actualizarEgreso(1, { monto: -50 })).rejects.toThrow(NotFoundError);
            await expect(service.actualizarEgreso(1, { monto: -50 })).rejects.toThrow("Egreso");
        });

        it("arroja BadRequestError si el monto actualizado es mayor a cero", async () => {
            const egresoAnterior = { id: 1, monto: -100 };
            transaccionRepository.buscarPorId.mockResolvedValue(egresoAnterior);

            await expect(service.actualizarEgreso(1, { monto: 50 })).rejects.toThrow(BadRequestError);
            await expect(service.actualizarEgreso(1, { monto: 50 })).rejects.toThrow("El monto debe ser menor o igual a cero para un egreso");
        });
    });

    describe("eliminarEgreso", () => {
        it("elimina el egreso exitosamente si existe", async () => {
            const egresoEliminado = { id: 1 };
            transaccionRepository.eliminar.mockResolvedValue(egresoEliminado);

            const resultado = await service.eliminarEgreso(1);

            expect(transaccionRepository.eliminar).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(egresoEliminado);
        });

        it("arroja NotFoundError si el egreso a eliminar no existe", async () => {
            transaccionRepository.eliminar.mockResolvedValue(null);

            await expect(service.eliminarEgreso(1)).rejects.toThrow(NotFoundError);
            await expect(service.eliminarEgreso(1)).rejects.toThrow("Egreso");
        });
    });
});