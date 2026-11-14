export const redondearPrecio = (precio) => Math.round(precio / 10) * 10;

export const formatearPrecio = (valor) =>
    `$ ${Number(valor ?? 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
