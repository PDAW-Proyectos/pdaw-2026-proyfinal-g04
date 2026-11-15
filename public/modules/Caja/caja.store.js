export function crearCajaStore() {
    let estado = {
        usuario: null,
        cajasAbiertas: [],
        caja: null,
        productos: [],
        categorias: [],
        ventas: [],
        movimientos: [],
        historial: [],
        carrito: [],
        ventasPausadas: [],
        metodoPago: null,
        modificador: { tipo: "descuento", modo: "porcentaje", valor: 0 },
    };
    const oyentes = new Set();

    const instantanea = () => ({
        ...estado,
        carrito: estado.carrito.map((item) => ({ ...item })),
        ventasPausadas: estado.ventasPausadas.map((venta) => ({
            ...venta,
            items: venta.items.map((item) => ({ ...item })),
        })),
        modificador: { ...estado.modificador },
    });

    const notificar = () => {
        const datos = instantanea();
        oyentes.forEach((oyente) => oyente(datos));
    };

    const normalizarCantidad = (producto, cantidad) => {
        const valor = Number(cantidad);

        if (!Number.isFinite(valor) || valor <= 0) {
            return { error: "La cantidad debe ser mayor a cero" };
        }

        if (!producto.peso && !Number.isInteger(valor)) {
            return { error: "Este producto solo admite cantidades enteras" };
        }

        return { valor };
    };

    const normalizarProducto = (producto, cantidad) => {
        const stock = Number(producto.stock);
        const precio = Number(producto.precio ?? producto.precioUsd * producto.cotizacion);

        if (!Number.isFinite(precio) || precio < 0) {
            return { error: "El producto no tiene un precio valido" };
        }

        if (Number.isFinite(stock) && cantidad > stock) {
            return { error: `Stock insuficiente. Disponible: ${stock}` };
        }

        return {
            item: {
                id: Number(producto.id),
                nombre: producto.nombre,
                precio,
                cantidad,
                stock: Number.isFinite(stock) ? stock : null,
                peso: Boolean(producto.peso),
                unidadMedida: producto.unidadMedida ?? producto.unidad ?? "u",
            },
        };
    };

    return {
        suscribir(oyente) {
            oyentes.add(oyente);
            return () => oyentes.delete(oyente);
        },

        obtenerEstado: instantanea,
        obtenerCarrito: () => estado.carrito.map((item) => ({ ...item })),
        obtenerCaja: () => (estado.caja ? { ...estado.caja } : null),
        obtenerProductos: () => [...estado.productos],
        obtenerCategorias: () => [...estado.categorias],
        obtenerVentas: () => [...estado.ventas],
        obtenerMovimientos: () => [...estado.movimientos],
        obtenerHistorial: () => [...estado.historial],
        obtenerCajasAbiertas: () => [...estado.cajasAbiertas],
        obtenerUsuario: () => (estado.usuario ? { ...estado.usuario } : null),
        obtenerMetodoPago: () => estado.metodoPago,
        obtenerModificador: () => ({ ...estado.modificador }),
        obtenerVentasPausadas: () => estado.ventasPausadas.map((venta) => ({
            ...venta,
            items: venta.items.map((item) => ({ ...item })),
        })),

        hayVentaActual: () => estado.carrito.length > 0,
        estaCajaAbierta: () => Boolean(estado.caja),

        establecerUsuario(usuario) {
            estado.usuario = usuario ? { ...usuario } : null;
            notificar();
        },

        establecerCajasAbiertas(cajas) {
            estado.cajasAbiertas = [...cajas];
            notificar();
        },

        establecerProductos(productos) {
            estado.productos = [...productos];
            notificar();
        },

        establecerCategorias(categorias) {
            estado.categorias = [...categorias];
            notificar();
        },

        establecerVentas(ventas) {
            estado.ventas = [...ventas];
            notificar();
        },

        establecerMovimientos(movimientos) {
            estado.movimientos = [...movimientos];
            notificar();
        },

        establecerHistorial(historial) {
            estado.historial = [...historial];
            notificar();
        },

        abrirCaja(caja) {
            estado.caja = { ...caja };
            notificar();
        },

        cerrarCaja() {
            estado.caja = null;
            estado.carrito = [];
            estado.metodoPago = null;
            estado.modificador = { tipo: "descuento", modo: "porcentaje", valor: 0 };
            notificar();
        },

        cantidadItems() {
            return estado.carrito.reduce((total, item) => total + item.cantidad, 0);
        },

        subtotal() {
            return estado.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
        },

        montoAjuste() {
            const { valor, modo } = estado.modificador;
            const monto = Number(valor);

            if (!Number.isFinite(monto) || monto <= 0) return 0;

            return modo === "porcentaje" ? estado.carrito.reduce(
                (total, item) => total + item.precio * item.cantidad,
                0
            ) * (monto / 100) : monto;
        },

        total() {
            const subtotal = estado.carrito.reduce(
                (total, item) => total + item.precio * item.cantidad,
                0
            );
            const ajuste = this.montoAjuste();

            if (estado.modificador.tipo === "descuento") {
                return Math.max(0, subtotal - ajuste);
            }

            return subtotal + ajuste;
        },

        puedeCobrar() {
            return Boolean(estado.caja) && estado.carrito.length > 0 && estado.metodoPago && this.total() > 0;
        },

        setMetodoPago(metodo) {
            estado.metodoPago = metodo;
            notificar();
        },

        setModificador({ tipo, modo, valor }) {
            estado.modificador = {
                tipo: tipo === "recargo" ? "recargo" : "descuento",
                modo: modo === "fijo" ? "fijo" : "porcentaje",
                valor: Number(valor) || 0,
            };
            notificar();
        },

        limpiarModificador() {
            estado.modificador = { tipo: "descuento", modo: "porcentaje", valor: 0 };
            notificar();
        },

        limpiarVenta() {
            estado.carrito = [];
            estado.metodoPago = null;
            estado.modificador = { tipo: "descuento", modo: "porcentaje", valor: 0 };
            notificar();
        },

        agregarProducto(producto, cantidad = 1) {
            if (!estado.caja) {
                return { ok: false, error: "La caja no esta abierta" };
            }

            const cantidadNormalizada = normalizarCantidad(producto, cantidad);
            if (cantidadNormalizada.error) {
                return { ok: false, error: cantidadNormalizada.error };
            }

            const itemExistente = estado.carrito.find((item) => item.id === Number(producto.id));
            const cantidadTotal = (itemExistente?.cantidad ?? 0) + cantidadNormalizada.valor;
            const productoNormalizado = normalizarProducto(producto, cantidadTotal);

            if (productoNormalizado.error) {
                return { ok: false, error: productoNormalizado.error };
            }

            if (itemExistente) {
                Object.assign(itemExistente, productoNormalizado.item);
            } else {
                estado.carrito.push(productoNormalizado.item);
            }

            notificar();
            return { ok: true };
        },

        actualizarCantidad(id, cantidad) {
            const item = estado.carrito.find((producto) => producto.id === Number(id));
            if (!item) return { ok: false, error: "El producto no esta en el changuito" };

            const cantidadNormalizada = normalizarCantidad(item, cantidad);
            if (cantidadNormalizada.error) {
                return { ok: false, error: cantidadNormalizada.error };
            }

            if (item.stock !== null && cantidadNormalizada.valor > item.stock) {
                return { ok: false, error: `Stock insuficiente. Disponible: ${item.stock}` };
            }

            item.cantidad = cantidadNormalizada.valor;
            notificar();
            return { ok: true };
        },

        quitarProducto(id) {
            const indice = estado.carrito.findIndex((item) => item.id === Number(id));
            if (indice === -1) return false;

            estado.carrito.splice(indice, 1);
            notificar();
            return true;
        },

        pausarVenta() {
            if (estado.carrito.length === 0) return false;

            const pausa = {
                id: Date.now(),
                hora: new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
                items: estado.carrito.map((item) => ({ ...item })),
            };

            estado.ventasPausadas.push(pausa);
            estado.carrito = [];
            notificar();

            return pausa;
        },

        recuperarVenta(id) {
            if (estado.carrito.length > 0) return "ocupado";

            const indice = estado.ventasPausadas.findIndex((venta) => venta.id === id);
            if (indice === -1) return false;

            estado.carrito = estado.ventasPausadas[indice].items.map((item) => ({ ...item }));
            estado.ventasPausadas.splice(indice, 1);
            notificar();

            return true;
        },
    };
}
