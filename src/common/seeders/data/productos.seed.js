
export const productosSeed = [
    // Productos por unidad con precio
    {
        id: 1,
        idCotizacion: 1,
        idCategoria: 1,
        nombre: "Coca-Cola 2.25L",
        descripcion: "Gaseosa Coca-Cola botella de 2.25 litros",
        precioUsd: 2.50,
        unidad: 10
    },
    {
        id: 2,
        idCotizacion: 1,
        idCategoria: 2,
        nombre: "Arroz Gallo Oro 1kg",
        descripcion: "Arroz largo fino paquete de 1kg",
        precioUsd: 1.80,
        unidad: 20
    },
    {
        id: 3,
        idCotizacion: 1,
        idCategoria: 2,
        nombre: "Aceite Natura 900ml",
        descripcion: "Aceite de girasol botella de 900ml",
        precioUsd: 2.20,
        unidad: 15
    },
    {
        id: 4,
        idCotizacion: 2,
        idCategoria: 2,
        nombre: "Yerba Playadito 1kg",
        descripcion: "Yerba mate con palo paquete de 1kg",
        precioUsd: 3.40,
        unidad: 40
    },
    {
        id: 5,
        idCotizacion: 2,
        idCategoria: 3,
        nombre: "Leche La Serenísima 1L",
        descripcion: "Leche entera larga vida",
        precioUsd: 1.30,
        unidad: 6
    },

    // Productos por peso con precio
    {
        id: 6,
        idCotizacion: 3,
        idCategoria: 4,
        nombre: "Queso Cremoso",
        descripcion: "Queso cremoso por kilogramo",
        precioUsd: 8.50,
        peso: 14,
        unidadMedida: "kg"
    },
    {
        id: 7,
        idCotizacion: 3,
        idCategoria: 4,
        nombre: "Jamón Cocido",
        descripcion: "Jamón cocido por kilogramo",
        precioUsd: 12.00,
        peso: 1,
        unidadMedida: "kg"
    },
    {
        id: 8,
        idCotizacion: 1,
        idCategoria: 4,
        nombre: "Salame",
        descripcion: "Salame por kilogramo",
        precioUsd: 14.00,
        peso: 2,
        unidadMedida: "kg"
    },
    {
        id: 9,
        idCotizacion: 4,
        idCategoria: 5,
        nombre: "Carne Picada",
        descripcion: "Carne picada común por kilogramo",
        precioUsd: 7.00,
        peso: 4,
        unidadMedida: "kg"
    },
    {
        id: 10,
        idCotizacion: 4,
        idCategoria: 6,
        nombre: "Tomate",
        descripcion: "Tomate fresco por kilogramo",
        precioUsd: 2.00,
        peso: 20,
        unidadMedida: "kg"
    },

    // Productos sin precio
    {
        id: 11,
        idCotizacion: 1,
        idCategoria: 1,
        nombre: "Producto sin precio unidad",
        descripcion: "Producto de prueba sin precio asignado",
        unidad: 5
    },
    {
        id: 12,
        idCotizacion: 1,
        idCategoria: 4,
        nombre: "Producto sin precio peso",
        descripcion: "Producto de prueba sin precio asignado",
        peso: 2,
        unidadMedida: "kg"
    }
];
