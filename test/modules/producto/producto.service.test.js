import { jest } from '@jest/globals';
import { ProductoService } from "../../../src/modules/Producto/producto.service.js";
import { BadRequestError, NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe('ProductoService', () => {
    let productoService;
    let mockProductoRepository;
    let mockCotizacionService;

    beforeEach(() => {
        mockProductoRepository = {
            listar: jest.fn(),
            listarPorPropiedades: jest.fn(),
            buscarPorId: jest.fn(),
            crear: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn(),
        };

        mockCotizacionService = {
            buscarCotizacion: jest.fn(),
            consultarCotizacion: jest.fn(),
        };

        productoService = new ProductoService(mockProductoRepository, mockCotizacionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarProductos()', () => {
        it('debe listar productos e inyectarles su cotización actual', () => {
            // Arrange
            const pagina = 1;
            const limite = 10;
            
            mockProductoRepository.listar.mockReturnValue({
                datos: [{ id: 1, nombre: 'Laptop', idCotizacion: 'USD' }],
                total: 1,
                pagina,
                limite
            });

            mockCotizacionService.buscarCotizacion.mockReturnValue({
                venta: 1000,
                fechaActualizacion: '2023-10-01'
            });

            // Act
            const resultado = productoService.listarProductos(pagina, limite);

            // Assert
            expect(mockProductoRepository.listar).toHaveBeenCalledWith(1, 10);
            expect(mockCotizacionService.buscarCotizacion).toHaveBeenCalledWith('USD');
            expect(resultado.productos[0]).not.toHaveProperty('idCotizacion');
            expect(resultado.productos[0].cotizacion).toBe(1000);
            expect(resultado.total).toBe(1);
        });
    });

    describe('buscarProducto()', () => {
        test('debe lanzar NotFoundError si el producto no existe', () => {
            // Arrange
            mockProductoRepository.buscarPorId.mockReturnValue(null);

            // Act & Assert
            expect(() => productoService.buscarProducto(99)).toThrow(NotFoundError);
        });
    });

    describe('actualizarPreciosMasivo()', () => {
        test('debe actualizar los productos y hacer commit a la transacción si todo sale bien', async () => {
            // Arrange
            const idsProductos = [1, 2];
            mockCotizacionService.consultarCotizacion.mockResolvedValue({ cotizacion: { id: 'USD_NUEVO' } });
            mockProductoRepository.buscarPorId.mockResolvedValue({ id: 1, nombre: 'A', idCotizacion: 'VIEJO' });
            mockProductoRepository.actualizar.mockResolvedValue(true);

            // Act
            await productoService.actualizarPreciosMasivo(idsProductos);

            // Assert
            expect(mockProductoRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(mockProductoRepository.actualizar).toHaveBeenCalledTimes(2);
            expect(mockProductoRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(mockProductoRepository.rollback).not.toHaveBeenCalled();
        });

        test('debe hacer rollback y propagar el error si algo falla', async () => {
            // Arrange
            const idsProductos = [1];
            mockCotizacionService.consultarCotizacion.mockRejectedValue(new Error("Error de API"));

            // Act & Assert
            await expect(productoService.actualizarPreciosMasivo(idsProductos)).rejects.toThrow("Error de API");
            
            expect(mockProductoRepository.iniciarTransaccion).toHaveBeenCalled();
            expect(mockProductoRepository.rollback).toHaveBeenCalled();
            expect(mockProductoRepository.confirmarTransaccion).not.toHaveBeenCalled();
        });
    });

    describe('disminuirStock()', () => {
        test.each([
            ["string en vez de número", "5"],
            ["número negativo", -5],
            ["cero", 0],
            ["NaN", NaN]
        ])('debe lanzar BadRequestError si la cantidad es %s', async (_, cantidadInvalida) => {
            await expect(productoService.disminuirStock(1, cantidadInvalida))
                .rejects.toThrow(BadRequestError);
        });

        test('debe lanzar BadRequestError si no hay stock suficiente (por unidad)', async () => {
            // Arrange
            mockProductoRepository.buscarPorId.mockResolvedValue({ id: 1, unidad: 5 });

            // Act & Assert
            await expect(productoService.disminuirStock(1, 10)).rejects.toThrow(BadRequestError);
            await expect(productoService.disminuirStock(1, 10)).rejects.toThrow("Stock insuficiente");
        });

        test('debe restar el stock por peso y actualizar en el repositorio', async () => {
            // Arrange
            const productoFalso = { id: 1, peso: 20.5 };
            mockProductoRepository.buscarPorId.mockResolvedValue(productoFalso);
            mockProductoRepository.actualizar.mockResolvedValue(true);

            // Act
            await productoService.disminuirStock(1, 5.5);

            // Assert
            expect(productoFalso.peso).toBe(15);
            expect(mockProductoRepository.actualizar).toHaveBeenCalledWith(productoFalso);
        });
    });
});