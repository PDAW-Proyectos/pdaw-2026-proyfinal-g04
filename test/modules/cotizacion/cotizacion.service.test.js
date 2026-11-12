import { jest } from '@jest/globals';
import { CotizacionService } from '../../../src/modules/cotizacion/cotizacion.service.js';
import { ExternalServiceError } from '../../../src/common/errors/errors.classes.js';

describe('CotizacionService', () => {
    let mockCotizacionRepository;
    let mockFetchFn;
    let cotizacionService;

    beforeEach(() => {
        mockCotizacionRepository = {
            listar: jest.fn().mockReturnValue({ datos: [] }),
            buscarPorId: jest.fn(),
            actualizar: jest.fn(),
            crear: jest.fn(),
            entidades: [],
            ultimaConsulta: null,
        };
        mockFetchFn = jest.fn();
        cotizacionService = new CotizacionService(mockCotizacionRepository, mockFetchFn);
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-10-01T15:00:00.000Z"));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('consultarCotizacion()', () => {
        it('debe hacer fetch y crear registro si NO hay "ultimaConsulta" en el repo', async () => {
            mockCotizacionRepository.ultimaConsulta = null;
            const apiResponseMock = { 
                venta: 1500, 
                fechaActualizacion: "2026-10-01T14:30:00.000Z" 
            };
            mockFetchFn.mockResolvedValue({
                ok: true,
                json: async () => apiResponseMock
            });
            mockCotizacionRepository.crear.mockResolvedValue({ id: 1, ...apiResponseMock });

            const resultado = await cotizacionService.consultarCotizacion();

            expect(mockFetchFn).toHaveBeenCalledWith("https://dolarapi.com/v1/dolares/blue");
            expect(mockCotizacionRepository.crear).toHaveBeenCalledWith(apiResponseMock);
            expect(mockCotizacionRepository.actualizar).not.toHaveBeenCalled();
            expect(mockCotizacionRepository.ultimaConsulta).toEqual(new Date("2026-10-01T15:00:00.000Z")); 
            expect(resultado.cotizacion.id).toBe(1);
        });

        it('NO debe consultar la API si estamos fuera del horario de mercado', async () => {
            jest.setSystemTime(new Date("2026-10-01T21:00:00.000Z"));
            mockCotizacionRepository.ultimaConsulta = new Date("2026-10-01T10:00:00.000Z");
            const ultimaCotizacion = { id: 1, venta: 1400 };
            mockCotizacionRepository.listar.mockReturnValue({ datos: [ultimaCotizacion] });

            const resultado = await cotizacionService.consultarCotizacion();

            expect(mockFetchFn).not.toHaveBeenCalled();
            expect(resultado.cotizacion).toEqual(ultimaCotizacion);
        });

        it('NO debe consultar la API si no pasaron 3 horas desde ultimaConsulta', async () => {
            mockCotizacionRepository.ultimaConsulta = new Date("2026-10-01T14:00:00.000Z");
            const ultimaCotizacion = { id: 1, venta: 1400 };
            mockCotizacionRepository.listar.mockReturnValue({ datos: [ultimaCotizacion] });

            const resultado = await cotizacionService.consultarCotizacion();

            expect(mockFetchFn).not.toHaveBeenCalled();
            expect(resultado.cotizacion).toEqual(ultimaCotizacion);
        });

        it('debe actualizar si han pasado 3 horas, y el fetch devuelve la MISMA fecha y valor', async () => {
            mockCotizacionRepository.ultimaConsulta = new Date("2026-10-01T11:00:00.000Z");
            const ultimaCotizacion = { 
                id: 1, 
                venta: 1500, 
                fechaActualizacion: "2026-10-01T12:00:00.000Z"
            };
            mockCotizacionRepository.listar.mockReturnValue({ datos: [ultimaCotizacion] });
            const apiResponseMock = { 
                venta: 1500, 
                fechaActualizacion: "2026-10-01T15:00:00.000Z" 
            };
            mockFetchFn.mockResolvedValue({
                ok: true,
                json: async () => apiResponseMock
            });
            mockCotizacionRepository.actualizar.mockResolvedValue({ ...ultimaCotizacion, fechaActualizacion: apiResponseMock.fechaActualizacion });

            const resultado = await cotizacionService.consultarCotizacion();

            expect(mockCotizacionRepository.actualizar).toHaveBeenCalledWith({
                ...ultimaCotizacion,
                fechaActualizacion: apiResponseMock.fechaActualizacion
            });
            expect(mockCotizacionRepository.crear).not.toHaveBeenCalled();
            expect(resultado.cotizacion.fechaActualizacion).toBe("2026-10-01T15:00:00.000Z");
        });

        it('lanzar ExternalServiceError si la API devuelve HTTP no 200/ok', async () => {
            mockCotizacionRepository.ultimaConsulta = null;
            mockFetchFn.mockResolvedValue({
                ok: false,
                status: 500
            });

            await expect(cotizacionService.consultarCotizacion()).rejects.toThrow(ExternalServiceError);
            await expect(cotizacionService.consultarCotizacion()).rejects.toThrow("DolarAPI");
        });

        it('lanzar ExternalServiceError si la API devuelve data mal formada', async () => {
            mockCotizacionRepository.ultimaConsulta = null;
            mockFetchFn.mockResolvedValue({
                ok: true,
                json: async () => ({ venta: "1500" })
            });

            await expect(cotizacionService.consultarCotizacion()).rejects.toThrow(ExternalServiceError);
        });
    });

    describe('listarCotizaciones()', () => {
        it('debe mapear el campo "datos" a "cotizacion" y esparcir los metadatos', async () => {
            const pagina = 1;
            const limite = 10;
            const mockRetornoRepo = {
                datos: [{ id: 1, venta: 1500 }, { id: 2, venta: 1510 }],
                total: 2,
                pagina: 1,
                limite: 10
            };
            mockCotizacionRepository.listar.mockReturnValue(mockRetornoRepo);

            const resultado = await cotizacionService.listarCotizaciones(pagina, limite);

            expect(mockCotizacionRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                cotizacion: mockRetornoRepo.datos,
                total: 2,
                pagina: 1,
                limite: 10
            });
        });
    });

    describe('buscarCotizacion()', () => {
        const entidadesMock = [
            { id: 1, venta: 1400 },
            { id: 2, venta: 1500 }
        ];

        beforeEach(() => {
            mockCotizacionRepository.entidades = entidadesMock;
        });

        it('debe devolver la última entidad si no se pasa id', () => {
            const resultado = cotizacionService.buscarCotizacion(undefined);
            expect(resultado).toEqual(entidadesMock[1]);
        });

        it('debe devolver la última entidad si el id pasado no existe', () => {
            mockCotizacionRepository.buscarPorId.mockReturnValue(null);
            
            const resultado = cotizacionService.buscarCotizacion(99);
            
            expect(mockCotizacionRepository.buscarPorId).toHaveBeenCalledWith(99);
            expect(resultado).toEqual(entidadesMock[1]);
        });

        it('debe devolver la entidad buscada si el id es válido y existe', () => {
            mockCotizacionRepository.buscarPorId.mockReturnValue(entidadesMock[0]);
            
            const resultado = cotizacionService.buscarCotizacion(1);
            
            expect(mockCotizacionRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(entidadesMock[0]);
        });
    });
});