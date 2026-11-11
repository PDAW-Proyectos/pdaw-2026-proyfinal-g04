import { jest } from '@jest/globals';
import { InsumoService } from "../../../src/modules/Insumo/insumo.service.js";
import { BadRequestError, NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe('InsumoService', () => {
    // mockReturnValue se utiliza para funciones sincrónicas.
    // mockResolvedValue se utiliza para funciones asíncronas que retornan promesas.
    let insumoService;
    let mockInsumoRepository;

    beforeEach(() => {
        mockInsumoRepository = {
            listar: jest.fn(),
            listarPorPropiedades: jest.fn(),
            buscarPorId: jest.fn(),
            crear: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
        };

        insumoService = new InsumoService(mockInsumoRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarInsumos()', () => {
        it('debe listar insumos transformando "datos" en "insumos"', () => {
            const pagina = 1;
            const limite = 10;
            const datosFalsos = [{ id: 1, nombre: 'Laptop' }];
            
            mockInsumoRepository.listar.mockReturnValue({
                datos: datosFalsos,
                total: 1,
                pagina,
                limite
            });

            const resultado = insumoService.listarInsumos(pagina, limite);

            expect(mockInsumoRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(resultado).toEqual({
                insumos: datosFalsos,
                total: 1,
                pagina,
                limite
            });
        });
    });

    describe('filtrarInsumos()', () => {
        it('debe filtrar insumos y mapear la respuesta correctamente', () => {
            const filtros = { nombre: 'Laptop' };
            const pagina = 1;
            const limite = 10;
            const datosFalsos = [{ id: 1, nombre: 'Laptop' }];

            mockInsumoRepository.listarPorPropiedades.mockReturnValue({
                datos: datosFalsos,
                total: 1,
                pagina,
                limite
            });

            const resultado = insumoService.filtrarInsumos(filtros, pagina, limite);

            expect(mockInsumoRepository.listarPorPropiedades).toHaveBeenCalledWith(filtros, 1, 10);
            expect(resultado).toEqual({
                insumos: datosFalsos,
                total: 1,
                pagina,
                limite
            });
        });
    });

    describe('buscarInsumo()', () => {
        it('debe retornar el insumo si existe', () => {
            const insumoMock = { id: 1, nombre: 'Laptop' };
            mockInsumoRepository.buscarPorId.mockReturnValue(insumoMock);

            const resultado = insumoService.buscarInsumo(1);

            expect(mockInsumoRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(insumoMock);
        });

        it('debe lanzar NotFoundError si el insumo no existe', () => {
            mockInsumoRepository.buscarPorId.mockReturnValue(null);

            expect(() => insumoService.buscarInsumo(99)).toThrow(NotFoundError);
            expect(() => insumoService.buscarInsumo(99)).toThrow("Insumo");
        });
    });

    describe('crearInsumo()', () => {
        it('debe crear un insumo a través del repositorio', async () => {
            const datosMock = { nombre: 'Mouse' };
            const creadoMock = { id: 2, ...datosMock };
            
            mockInsumoRepository.crear.mockResolvedValue(creadoMock);

            const resultado = await insumoService.crearInsumo(datosMock);

            expect(mockInsumoRepository.crear).toHaveBeenCalledWith(datosMock);
            expect(resultado).toEqual(creadoMock);
        });
    });

    describe('actualizarInsumo()', () => {
        it('debe actualizar fusionando los datos anteriores con los nuevos', async () => {
            const id = 1;
            const datosNuevos = { precio: 500 };
            const insumoAnterior = { id: 1, nombre: 'Laptop', precio: 400 };
            
            mockInsumoRepository.buscarPorId.mockResolvedValue(insumoAnterior);
            mockInsumoRepository.actualizar.mockResolvedValue({ ...insumoAnterior, ...datosNuevos });

            const resultado = await insumoService.actualizarInsumo(id, datosNuevos);

            expect(mockInsumoRepository.buscarPorId).toHaveBeenCalledWith(id);
            expect(mockInsumoRepository.actualizar).toHaveBeenCalledWith({
                id: 1, 
                nombre: 'Laptop', 
                precio: 500
            });
            expect(resultado.precio).toBe(500);
        });

        it('debe lanzar NotFoundError si el insumo a actualizar no existe', async () => {
            mockInsumoRepository.buscarPorId.mockResolvedValue(null);

            await expect(insumoService.actualizarInsumo(99, { nombre: 'test' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('eliminarInsumo()', () => {
        it('debe eliminar el insumo y retornar el resultado', async () => {
            const eliminadoMock = { id: 1, nombre: 'Laptop' };
            mockInsumoRepository.eliminar.mockResolvedValue(eliminadoMock);

            const resultado = await insumoService.eliminarInsumo(1);

            expect(mockInsumoRepository.eliminar).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(eliminadoMock);
        });

        it('debe lanzar NotFoundError si el insumo no fue encontrado para eliminar', async () => {
            mockInsumoRepository.eliminar.mockResolvedValue(null);

            await expect(insumoService.eliminarInsumo(99)).rejects.toThrow(NotFoundError);
        });
    });

    describe('aumentarStock()', () => {
        test.each([
            ["string", "5"],
            ["número negativo", -5],
            ["cero", 0],
            ["decimal", 5.5],
            ["NaN", NaN]
        ])('debe lanzar BadRequestError si la cantidad es %s', async (_, cantidadInvalida) => {
            await expect(insumoService.aumentarStock(1, cantidadInvalida)).rejects.toThrow(BadRequestError);
            await expect(insumoService.aumentarStock(1, cantidadInvalida)).rejects.toThrow("La cantidad debe ser un número entero positivo");
        });

        it('debe sumar la cantidad a la unidad y actualizar', async () => {
            const insumoMock = { id: 1, unidad: 10 };
            mockInsumoRepository.buscarPorId.mockReturnValue(insumoMock);
            mockInsumoRepository.actualizar.mockResolvedValue({ id: 1, unidad: 15 });

            const resultado = await insumoService.aumentarStock(1, 5);

            expect(mockInsumoRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(insumoMock.unidad).toBe(15);
            expect(mockInsumoRepository.actualizar).toHaveBeenCalledWith(insumoMock);
            expect(resultado.unidad).toBe(15);
        });
    });

    describe('disminuirStock()', () => {
        test.each([
            ["string en vez de número", "5"],
            ["número negativo", -5],
            ["cero", 0],
            ["decimal", 5.5],
            ["NaN", NaN]
        ])('debe lanzar BadRequestError si la cantidad es %s', async (_, cantidadInvalida) => {
            await expect(insumoService.disminuirStock(1, cantidadInvalida)).rejects.toThrow(BadRequestError);
            await expect(insumoService.disminuirStock(1, cantidadInvalida)).rejects.toThrow("La cantidad debe ser un número entero positivo");
        });

        it('debe lanzar BadRequestError si no hay stock suficiente (por unidad)', async () => {
            const insumoMock = { id: 1, unidad: 5 };
            mockInsumoRepository.buscarPorId.mockReturnValue(insumoMock);

            await expect(insumoService.disminuirStock(1, 10)).rejects.toThrow(BadRequestError);
            await expect(insumoService.disminuirStock(1, 10)).rejects.toThrow("Stock insuficiente");
        });

        it('debe restar el stock por unidad y actualizar en el repositorio', async () => {
            const insumoMock = { id: 1, unidad: 20 };
            mockInsumoRepository.buscarPorId.mockReturnValue(insumoMock);
            mockInsumoRepository.actualizar.mockResolvedValue({ id: 1, unidad: 15 });

            const resultado = await insumoService.disminuirStock(1, 5);

            expect(insumoMock.unidad).toBe(15);
            expect(mockInsumoRepository.actualizar).toHaveBeenCalledWith(insumoMock);
            expect(resultado.unidad).toBe(15);
        });
    });
});