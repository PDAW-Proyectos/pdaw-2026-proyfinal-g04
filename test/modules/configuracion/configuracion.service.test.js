import { jest } from '@jest/globals';
import { ConfiguracionService } from "../../../src/modules/configuracion/configuracion.service.js";
import { BadRequestError, NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe("ConfiguracionService", () => {
    let mockRepository;
    let service;

    beforeEach(() => {
        mockRepository = {
            configuracion: { sessionExpiringTime: 28800000 },
            actualizarConfiguracion: jest.fn()
        };
        service = new ConfiguracionService(mockRepository);
    });

    describe("obtenerConfiguracion", () => {
        test("retorna la configuración correctamente si existe en el repositorio", async () => {
            const resultado = await service.obtenerConfiguracion();
            expect(resultado).toEqual({
                configuracion: {
                    sessionExpiringTime: 28800000,
                    sessionDurationMinutes: 480
                }
            });
        });

        test("arroja NotFoundError si la configuración no existe", async () => {
            mockRepository.configuracion = undefined;
            await expect(service.obtenerConfiguracion()).rejects.toThrow(NotFoundError);
            await expect(service.obtenerConfiguracion()).rejects.toThrow("La configuración no existe");
        });
    });

    describe("obtenerSesion", () => {
        test("retorna un objeto con sessionExpiringTime obtenido de la configuración", async () => {
            mockRepository.configuracion = { sessionExpiringTime: 7200000 };
            
            const resultado = await service.obtenerSesion();
            
            expect(resultado).toEqual({ sessionExpiringTime: 7200000 });
        });

        test("propaga NotFoundError si obtenerConfiguracion falla", async () => {
            mockRepository.configuracion = null;
            await expect(service.obtenerSesion()).rejects.toThrow(NotFoundError);
        });
    });

    describe("actualizarDuracionSesion", () => {
        test("calcula en milisegundos, actualiza el repositorio y retorna los datos al recibir una hora válida", async () => {
            const datos = { duracionHoras: 10 };
            const resultado = await service.actualizarDuracionSesion(datos);
            const milisegundosEsperados = 10 * 60 * 60 * 1000;

            expect(mockRepository.actualizarConfiguracion).toHaveBeenCalledWith({
                sessionExpiringTime: milisegundosEsperados
            });
            expect(resultado).toEqual({
                duracionHoras: 10,
                duracionSesion: milisegundosEsperados
            });
        });

        test("funciona correctamente con el límite válido de 1 hora", async () => {
            const resultado = await service.actualizarDuracionSesion({ duracionHoras: 1 });
            expect(mockRepository.actualizarConfiguracion).toHaveBeenCalledWith({ sessionExpiringTime: 3600000 });
            expect(resultado.duracionHoras).toBe(1);
        });

        test("funciona correctamente con el límite válido de 24 horas", async () => {
            const resultado = await service.actualizarDuracionSesion({ duracionHoras: 24 });
            expect(mockRepository.actualizarConfiguracion).toHaveBeenCalledWith({ sessionExpiringTime: 86400000 });
            expect(resultado.duracionHoras).toBe(24);
        });

        test.each([
            { descripcion: "es undefined", valor: undefined },
            { descripcion: "es null", valor: null },
            { descripcion: "es un string", valor: "12" },
            { descripcion: "es un decimal", valor: 5.5 },
            { descripcion: "es cero", valor: 0 },
            { descripcion: "es negativo", valor: -5 },
            { descripcion: "es mayor a 24", valor: 25 }
        ])("arroja BadRequestError si duracionHoras $descripcion", async ({ valor }) => {
            const datos = { duracionHoras: valor };
            await expect(service.actualizarDuracionSesion(datos)).rejects.toThrow(BadRequestError);
            await expect(service.actualizarDuracionSesion(datos)).rejects.toThrow("La duración debe ser un número entero mayor a cero y menor o igual a 24");
            expect(mockRepository.actualizarConfiguracion).not.toHaveBeenCalled();
        });
    });
});