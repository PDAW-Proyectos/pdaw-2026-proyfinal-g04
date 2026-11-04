export function coincidePropiedad(objeto, propiedades) {
    return Object.entries(propiedades).every(([key, value]) => {
        if (Array.isArray(value)) {
            return value.every((elemento) =>
                objeto[key].some((e) => coincidePropiedad(e, elemento))
            );
        }
        if (typeof value === "object" && value !== null) {
            return coincidePropiedad(objeto[key], value);
        }
        return objeto[key] === value;
    });
}