export function coincidePropiedad(objeto, propiedades) {
    return Object.entries(propiedades).every(([key, value]) => {
        const propiedad = objeto[key];

        if (Array.isArray(value)) {
            if (Array.isArray(propiedad)) {
                return value.every((criterio) =>
                    propiedad.some((e) =>
                        typeof criterio === "object" && criterio !== null
                            ? coincidePropiedad(e, criterio)
                            : e === criterio
                    )
                );
            }

            return value.some((criterio) => propiedad === criterio);
        }

        if (typeof value === "object" && value !== null) {
            return coincidePropiedad(propiedad, value);
        }

        return propiedad === value;
    });
}