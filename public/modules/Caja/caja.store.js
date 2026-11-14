export function crearCajaStore() {
    let carrito = [];
    let ventasPausadas = [];
    const oyentes = new Set();

    const notificar = () => {
        oyentes.forEach((oyente) => oyente({ carrito, ventasPausadas }));
    };

    return {
        suscribir(oyente) {
            oyentes.add(oyente);
            return () => oyentes.delete(oyente);
        },

        obtenerCarrito: () => [...carrito],

        hayVentaActual: () => carrito.length > 0,

        cantidadItems() {
            return carrito.reduce((total, item) => total + item.cantidad, 0);
        },

        subtotal() {
            return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
        },

        agregarProducto({ id, nombre, precio }, cantidad = 1) {
            const itemExistente = carrito.find((item) => item.id === id);

            if (itemExistente) {
                itemExistente.cantidad += cantidad;
            } else {
                carrito.push({ id, nombre, precio, cantidad });
            }

            notificar();
        },

        pausarVenta() {
            if (carrito.length === 0) return false;

            const pausa = {
                id: Date.now(),
                hora: new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                items: [...carrito],
            };

            ventasPausadas.push(pausa);
            carrito = [];
            notificar();

            return pausa;
        },

        recuperarVenta(id) {
            if (carrito.length > 0) return "ocupado";

            const indice = ventasPausadas.findIndex((venta) => venta.id === id);
            if (indice === -1) return false;

            carrito = [...ventasPausadas[indice].items];
            ventasPausadas.splice(indice, 1);
            notificar();

            return true;
        },

        obtenerVentasPausadas: () => [...ventasPausadas],
    };
}
