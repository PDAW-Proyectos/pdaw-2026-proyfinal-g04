import { jest } from '@jest/globals';
import { ProductoService } from "../../../src/modules/producto/producto.service.js";
import { BadRequestError, NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe('ProductoService', () => {
    let productoService;
    let mockProductoRepository;
    let mockCotizacionService;
    let mockMovimientoStockRepository;
    let mockMovimientoStockService;
    let mockCategoriaRepository;
    let mockUserRepository;

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

        mockMovimientoStockRepository = {
            iniciarTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
            rollback: jest.fn(),
        };
        mockMovimientoStockService = {
            movimientoStockRepository: mockMovimientoStockRepository,
            registrarMovimiento: jest.fn().mockResolvedValue({ id: 1 }),
        };
        mockCategoriaRepository = {
            buscarPorId: jest.fn().mockResolvedValue({ id: 2, nombre: "Almacén" }),
        };
        mockUserRepository = {
            buscarPorId: jest.fn().mockResolvedValue({ id: 7, nombre: "Ana", apellido: "Pérez" }),
        };

        productoService = new ProductoService(
            mockProductoRepository,
            mockCotizacionService,
            mockMovimientoStockService,
            mockCategoriaRepository,
            mockUserRepository,
        );
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

    describe('filtrarProductos()', () => {
        it('debe inyectar la cotización en los productos filtrados', () => {
            mockProductoRepository.listarPorPropiedades.mockReturnValue({
                datos: [{ id: 1, nombre: 'Coca', idCotizacion: 2 }],
                total: 1,
                pagina: 1,
                limite: 10
            });
            mockCotizacionService.buscarCotizacion.mockReturnValue({
                venta: 1200,
                fechaActualizacion: '2026-11-15'
            });

            const resultado = productoService.filtrarProductos({ nombre: 'coca' }, 1, 10);

            expect(mockProductoRepository.listarPorPropiedades).toHaveBeenCalledWith({ nombre: 'coca' }, 1, 10);
            expect(resultado.productos[0].cotizacion).toBe(1200);
            expect(resultado.productos[0].cotizacionFecha).toBe('2026-11-15');
            expect(resultado.productos[0]).not.toHaveProperty('idCotizacion');
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
            const productoFalso = {
                id: 1,
                nombre: "Yerba",
                idCategoria: 2,
                peso: 20.5,
                unidadMedida: "kg",
            };
            mockProductoRepository.buscarPorId.mockResolvedValue(productoFalso);
            mockProductoRepository.actualizar.mockResolvedValue(productoFalso);

            // Act
            await productoService.disminuirStock(1, 5.5, 7);

            // Assert
            expect(productoFalso.peso).toBe(15);
            expect(mockProductoRepository.actualizar).toHaveBeenCalledWith(productoFalso);
            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                idProducto: 1,
                idCategoria: 2,
                tipo: "salida",
                cantidad: -5.5,
                unidadMedida: "kg",
                stockAnterior: 20.5,
                stockNuevo: 15,
                idUsuario: 7,
                nombreUsuario: "Ana Pérez",
            }));
        });
    });

    describe('registrar movimientos de stock', () => {
        test('registra la eliminación y luego elimina el producto del catálogo', async () => {
            const producto = {
                id: 4,
                nombre: "Leche",
                idCategoria: 2,
                unidad: 6,
            };
            mockProductoRepository.buscarPorId.mockResolvedValue(producto);
            mockProductoRepository.eliminar.mockResolvedValue(true);

            await expect(productoService.eliminarProducto(4, 7)).resolves.toBe(true);

            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                idProducto: 4,
                nombreProducto: "Leche",
                tipo: "eliminacion",
                cantidad: -6,
                unidadMedida: "unidad",
                stockAnterior: 6,
                stockNuevo: 0,
                idUsuario: 7,
            }));
            expect(mockProductoRepository.eliminar).toHaveBeenCalledWith(4);
            expect(mockProductoRepository.confirmarTransaccion).toHaveBeenCalled();
            expect(mockMovimientoStockRepository.confirmarTransaccion).toHaveBeenCalled();
        });

        test('registra la eliminación aunque el producto ya no tenga stock', async () => {
            const producto = {
                id: 4,
                nombre: "Leche",
                idCategoria: 2,
                unidad: 0,
            };
            mockProductoRepository.buscarPorId.mockResolvedValue(producto);
            mockProductoRepository.eliminar.mockResolvedValue(true);

            await productoService.eliminarProducto(4, 7);

            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                tipo: "eliminacion",
                cantidad: 0,
                stockAnterior: 0,
                stockNuevo: 0,
            }));
        });

        test('registra el stock inicial de un producto con el usuario que lo creó', async () => {
            const producto = {
                id: 5,
                nombre: "Yerba",
                idCategoria: 2,
                unidad: 8,
            };
            mockCotizacionService.consultarCotizacion.mockResolvedValue({ cotizacion: { id: 4 } });
            mockProductoRepository.crear.mockResolvedValue(producto);

            await productoService.crearProducto({ nombre: "Yerba", idCategoria: 2, unidad: 8 }, 7);

            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                idProducto: 5,
                tipo: "entrada",
                stockAnterior: 0,
                stockNuevo: 8,
                idUsuario: 7,
                nombreUsuario: "Ana Pérez",
            }));
        });

        test('registra una entrada cuando la edición manual aumenta el stock', async () => {
            const anterior = {
                id: 5,
                nombre: "Yerba",
                idCategoria: 2,
                unidad: 6,
            };
            const actualizado = { ...anterior, unidad: 18 };
            mockProductoRepository.buscarPorId.mockResolvedValue(anterior);
            mockProductoRepository.actualizar.mockResolvedValue(actualizado);

            await productoService.actualizarProducto(5, { unidad: 18 }, 7);

            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                tipo: "entrada",
                cantidad: 12,
                stockAnterior: 6,
                stockNuevo: 18,
                idUsuario: 7,
            }));
        });

        test('registra una salida cuando la edición manual disminuye el stock', async () => {
            const anterior = {
                id: 5,
                nombre: "Yerba",
                idCategoria: 2,
                unidad: 18,
            };
            const actualizado = { ...anterior, unidad: 6 };
            mockProductoRepository.buscarPorId.mockResolvedValue(anterior);
            mockProductoRepository.actualizar.mockResolvedValue(actualizado);

            await productoService.actualizarProducto(5, { unidad: 6 }, 7);

            expect(mockMovimientoStockService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
                tipo: "salida",
                cantidad: -12,
                stockAnterior: 18,
                stockNuevo: 6,
                idUsuario: 7,
            }));
        });

        test('registra una cantidad ponderada sin redondearla y conserva su unidad', async () => {
            const producto = {
                id: 3,
                nombre: "Producto por peso",
                idCategoria: 2,
                peso: 1.2345,
                unidadMedida: "g",
            };
            mockProductoRepository.buscarPorId.mockResolvedValue(producto);
            mockProductoRepository.actualizar.mockResolvedValue(producto);

            await productoService.aumentarStock(3, 0.00005, 7);

            const movimiento = mockMovimientoStockService.registrarMovimiento.mock.calls[0][0];
            expect(movimiento.unidadMedida).toBe("g");
            expect(movimiento.stockAnterior).toBe(1.2345);
            expect(movimiento.stockNuevo).toBe(producto.peso);
            expect(movimiento.cantidad).toBe(movimiento.stockNuevo - movimiento.stockAnterior);
        });

        test('revierte stock e historial si falla el registro del movimiento', async () => {
            const producto = {
                id: 1,
                nombre: "Yerba",
                idCategoria: 2,
                unidad: 5,
            };
            mockProductoRepository.buscarPorId.mockResolvedValue(producto);
            mockProductoRepository.actualizar.mockResolvedValue(producto);
            mockMovimientoStockService.registrarMovimiento.mockRejectedValue(new Error("Error de historial"));

            await expect(productoService.aumentarStock(1, 2, 7)).rejects.toThrow("Error de historial");

            expect(mockProductoRepository.rollback).toHaveBeenCalled();
            expect(mockMovimientoStockRepository.rollback).toHaveBeenCalled();
        });
    });
});