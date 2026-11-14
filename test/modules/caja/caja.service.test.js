import { jest } from '@jest/globals';
import {  CajaService } from "../../../src/modules/caja/caja.service.js";
import { BadRequestError, NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe("CajaService", () => {
    let cajaRepository;
    let transaccionRepository;
    let productoRepository;
    let ingresoService;
    let egresoService;
    let service;

    beforeEach(() => {
        jest.clearAllMocks();

        cajaRepository = {
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

        transaccionRepository = {
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn()
        };

        ingresoService = {
            productoService: {
                productoRepository
            },
            transaccionRepository: transaccionRepository,
            crearVenta: jest.fn()
        };

        egresoService = {
            transaccionRepository: transaccionRepository,
            crearEgreso: jest.fn()
        };

        service = new CajaService(cajaRepository, ingresoService, egresoService);
    });

    describe("listarCajas", () => {
        it("retorna las cajas mapeadas y la paginación correctamente", () => {
            const mockResultadoRepo = {
                datos: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            };
            cajaRepository.listar.mockReturnValue(mockResultadoRepo);

            const resultado = service.listarCajas(1, 10);

            expect(cajaRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                cajas: [{ id: 1 }, { id: 2 }],
                total: 2,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("filtrarCajas", () => {
        it("retorna las cajas filtradas mapeadas y la paginación correctamente", () => {
            const filtros = { estado: "abierta" };
            const mockResultadoRepo = {
                datos: [{ id: 1, estado: "abierta" }],
                total: 1,
                pagina: 1,
                limite: 10
            };
            cajaRepository.listarPorPropiedades.mockReturnValue(mockResultadoRepo);

            const resultado = service.filtrarCajas(filtros, 1, 10);

            expect(cajaRepository.listarPorPropiedades).toHaveBeenCalledWith(filtros, 1, 10);
            expect(resultado).toEqual({
                cajas: [{ id: 1, estado: "abierta" }],
                total: 1,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe("buscarCaja", () => {
        it("retorna la caja si es encontrada", () => {
            const cajaMock = { id: 1, estado: "abierta" };
            cajaRepository.buscarPorId.mockReturnValue(cajaMock);

            const resultado = service.buscarCaja(1);

            expect(cajaRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(cajaMock);
        });

        it("arroja NotFoundError si la caja no existe", () => {
            cajaRepository.buscarPorId.mockReturnValue(null);

            expect(() => service.buscarCaja(99)).toThrow(NotFoundError);
            expect(() => service.buscarCaja(99)).toThrow("Caja");
        });
    });

    describe("crearCaja", () => {
        it("crea y retorna la nueva caja", async () => {
            const datosNuevos = { nroCaja: 1, montoInicial: 100 };
            const cajaCreada = { id: 1, ...datosNuevos };
            cajaRepository.crear.mockResolvedValue(cajaCreada);

            const resultado = await service.crearCaja(datosNuevos);

            expect(cajaRepository.crear).toHaveBeenCalledWith(datosNuevos);
            expect(resultado).toEqual(cajaCreada);
        });
    });

    describe("registrarVenta", () => {
        const idCaja = 1;
        const idUsuario = 5;
        const datosVenta = { monto: 500, metodoDePago: "efectivo" };
        const cajaAbierta = { id: 1, estado: "abierta", totalEsperado: 1000, historialDeTransacciones: [] };

        it("registra una venta en efectivo correctamente y actualiza la caja con transacciones", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);
            const ventaMock = { id: 10, monto: 500 };
            ingresoService.crearVenta.mockResolvedValue(ventaMock);
            cajaRepository.actualizar.mockResolvedValue({ ...cajaAbierta, totalEsperado: 1500 });

            const resultado = await service.registrarVenta(idCaja, idUsuario, datosVenta);

            expect(cajaRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(ingresoService.crearVenta).toHaveBeenCalledWith(idUsuario, { ...datosVenta, idCaja: 1 }, { administrarTransacciones: false });
            expect(cajaRepository.actualizar).toHaveBeenCalledWith({
                ...cajaAbierta,
                totalEsperado: 1500,
                historialDeTransacciones: [10]
            });
            expect(cajaRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(transaccionRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(resultado).toEqual({
                id: 1,
                totalEsperado: 1500,
                venta: ventaMock
            });
        });

        it("registra una venta con tarjeta sin modificar el totalEsperado de efectivo", async () => {
            const datosTarjeta = { monto: 500, metodoDePago: "tarjeta" };
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);
            const ventaMock = { id: 11, monto: 500 };
            ingresoService.crearVenta.mockResolvedValue(ventaMock);

            const resultado = await service.registrarVenta(idCaja, idUsuario, datosTarjeta);

            expect(cajaRepository.actualizar).toHaveBeenCalledWith(
                expect.objectContaining({ totalEsperado: 1000 })
            );
            expect(resultado.totalEsperado).toBe(1000);
        });

        it("arroja NotFoundError si la caja no existe", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(null);

            await expect(service.registrarVenta(idCaja, idUsuario, datosVenta)).rejects.toThrow(NotFoundError);
            await expect(service.registrarVenta(idCaja, idUsuario, datosVenta)).rejects.toThrow("La caja no existe");
        });

        it("arroja BadRequestError si la caja está cerrada", async () => {
            cajaRepository.buscarPorId.mockResolvedValue({ ...cajaAbierta, estado: "cerrada" });

            await expect(service.registrarVenta(idCaja, idUsuario, datosVenta)).rejects.toThrow(BadRequestError);
            await expect(service.registrarVenta(idCaja, idUsuario, datosVenta)).rejects.toThrow("No se pueden registrar ventas en una caja cerrada");
        });

        it.each([
            { desc: "no es un número finito", valor: NaN },
            { desc: "es cero", valor: 0 },
            { desc: "es negativo", valor: -100 }
        ])("arroja BadRequestError si el monto de la venta $desc", async ({ valor }) => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);

            await expect(service.registrarVenta(idCaja, idUsuario, { ...datosVenta, monto: valor })).rejects.toThrow(BadRequestError);
            await expect(service.registrarVenta(idCaja, idUsuario, { ...datosVenta, monto: valor })).rejects.toThrow("El monto de la venta debe ser mayor a cero");
        });

        it("ejecuta rollback en los repositorios si ocurre un error durante el proceso", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);
            const errorPrueba = new Error("Error en la base de datos");
            ingresoService.crearVenta.mockRejectedValue(errorPrueba);

            await expect(service.registrarVenta(idCaja, idUsuario, datosVenta)).rejects.toThrow(errorPrueba);
            expect(cajaRepository.rollback).toHaveBeenCalled();
            expect(transaccionRepository.rollback).toHaveBeenCalled();
        });
    });

    describe("retirarEfectivo", () => {
        const idCaja = 1;
        const idUsuario = 5;
        const datosRetiro = { monto: 200, motivo: "Pago a proveedor" };
        const cajaAbierta = { id: 1, estado: "abierta", totalEsperado: 1000, historialDeTransacciones: [] };

        it("registra un retiro de efectivo correctamente y actualiza la caja", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);
            const egresoMock = { id: 20, monto: -200 };
            egresoService.crearEgreso.mockResolvedValue(egresoMock);

            const resultado = await service.retirarEfectivo(idCaja, idUsuario, datosRetiro);

            expect(egresoService.crearEgreso).toHaveBeenCalledWith({
                ...datosRetiro,
                monto: -200,
                metodoDePago: "efectivo",
                idUsuario,
                idCaja: 1
            }, { administrarTransacciones: false });
            expect(cajaRepository.actualizar).toHaveBeenCalledWith(
                expect.objectContaining({ totalEsperado: 800, historialDeTransacciones: [20] })
            );
            expect(cajaRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(transaccionRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(resultado).toEqual({
                id: 1,
                totalEsperado: 800,
                egreso: egresoMock
            });
        });

        it("arroja NotFoundError si la caja no existe", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(null);
            await expect(service.retirarEfectivo(idCaja, idUsuario, datosRetiro)).rejects.toThrow(NotFoundError);
        });

        it("arroja BadRequestError si la caja está cerrada", async () => {
            cajaRepository.buscarPorId.mockResolvedValue({ ...cajaAbierta, estado: "cerrada" });

            await expect(service.retirarEfectivo(idCaja, idUsuario, datosRetiro)).rejects.toThrow(BadRequestError);
            await expect(service.retirarEfectivo(idCaja, idUsuario, datosRetiro)).rejects.toThrow("No se pueden registrar retiros en una caja cerrada");
        });

        it("arroja BadRequestError si el monto a retirar supera el efectivo esperado en caja", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);

            await expect(service.retirarEfectivo(idCaja, idUsuario, { monto: 1500 })).rejects.toThrow(BadRequestError);
            await expect(service.retirarEfectivo(idCaja, idUsuario, { monto: 1500 })).rejects.toThrow("No hay suficiente efectivo en la caja para realizar el retiro");
        });

        it("ejecuta rollback si ocurre un error al retirar efectivo", async () => {
            cajaRepository.buscarPorId.mockResolvedValue(cajaAbierta);
            const errorPrueba = new Error("Fallo en egreso");
            egresoService.crearEgreso.mockRejectedValue(errorPrueba);

            await expect(service.retirarEfectivo(idCaja, idUsuario, datosRetiro)).rejects.toThrow(errorPrueba);
            expect(cajaRepository.rollback).toHaveBeenCalled();
            expect(transaccionRepository.rollback).toHaveBeenCalled();
        });
    });

    describe("actualizarCaja", () => {
        it("actualiza la caja correctamente si existe", async () => {
            const cajaAnterior = { id: 1, nroCaja: 1 };
            const datosNuevos = { observaciones: ["Revisada"] };
            cajaRepository.buscarPorId.mockReturnValue(cajaAnterior);
            cajaRepository.actualizar.mockResolvedValue({ ...cajaAnterior, ...datosNuevos });

            const resultado = await service.actualizarCaja(1, datosNuevos);

            expect(cajaRepository.actualizar).toHaveBeenCalledWith({ id: 1, nroCaja: 1, observaciones: ["Revisada"] });
            expect(resultado.observaciones).toEqual(["Revisada"]);
        });

        it("arroja NotFoundError si la caja a actualizar no existe", async () => {
            cajaRepository.buscarPorId.mockReturnValue(null);
            await expect(service.actualizarCaja(1, {})).rejects.toThrow(NotFoundError);
        });
    });

    describe("cerrarCaja", () => {
        const cajaAbierta = { id: 1, estado: "abierta", totalEsperado: 1000, observaciones: [] };

        it("cierra la caja correctamente calculando la diferencia y actualizando datos", async () => {
            cajaRepository.buscarPorId.mockReturnValue(cajaAbierta);
            cajaRepository.actualizar.mockImplementation((caja) => Promise.resolve(caja));
            const datosCierre = { totalContado: 950, observaciones: ["Faltante de 50"] };

            const resultado = await service.cerrarCaja(1, datosCierre, "supervisor@test.com");

            expect(resultado.estado).toBe("cerrada");
            expect(resultado.usuarioCierra).toBe("supervisor@test.com");
            expect(resultado.totalContado).toBe(950);
            expect(resultado.diferencia).toBe(-50);
            expect(resultado.observaciones).toEqual(["Faltante de 50"]);
            expect(typeof resultado.fechaCierre).toBe("string");
        });

        it("arroja NotFoundError si la caja no existe al intentar cerrar", async () => {
            cajaRepository.buscarPorId.mockReturnValue(null);
            await expect(service.cerrarCaja(1, { totalContado: 1000 }, "admin")).rejects.toThrow(NotFoundError);
        });

        it("arroja BadRequestError si la caja ya se encuentra cerrada", async () => {
            cajaRepository.buscarPorId.mockReturnValue({ ...cajaAbierta, estado: "cerrada" });

            await expect(service.cerrarCaja(1, { totalContado: 1000 }, "admin")).rejects.toThrow(BadRequestError);
            await expect(service.cerrarCaja(1, { totalContado: 1000 }, "admin")).rejects.toThrow("La caja ya se encuentra cerrada");
        });

        it.each([
            { desc: "no es finito", valor: NaN },
            { desc: "es negativo", valor: -50 }
        ])("arroja BadRequestError si totalContado $desc", async ({ valor }) => {
            cajaRepository.buscarPorId.mockReturnValue(cajaAbierta);

            await expect(service.cerrarCaja(1, { totalContado: valor }, "admin")).rejects.toThrow(BadRequestError);
            await expect(service.cerrarCaja(1, { totalContado: valor }, "admin")).rejects.toThrow("totalContado debe ser un número mayor o igual a cero");
        });
    });

    describe("eliminarCaja", () => {
        it("elimina la caja exitosamente", async () => {
            const cajaEliminada = { id: 1 };
            cajaRepository.eliminar.mockResolvedValue(cajaEliminada);

            const resultado = await service.eliminarCaja(1);

            expect(cajaRepository.eliminar).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(cajaEliminada);
        });

        it("arroja NotFoundError si la caja a eliminar no existe", async () => {
            cajaRepository.eliminar.mockResolvedValue(null);

            await expect(service.eliminarCaja(1)).rejects.toThrow(NotFoundError);
            await expect(service.eliminarCaja(1)).rejects.toThrow("Caja");
        });
    });
});