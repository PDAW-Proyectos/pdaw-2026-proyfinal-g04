export function coincidePropiedad(objeto, propiedades) {
    return Object.entries(propiedades).every(([key, value]) => {
        const propiedad = objeto[key];

        if (Array.isArray(value)) {
            if (Array.isArray(propiedad)) {
                return value.every((criterio) =>
                    propiedad.some((e) =>
                        typeof criterio === "object" && criterio !== null
                            ? coincidePropiedad(e, criterio)
                            : typeof criterio === "string" && typeof e === "string"
                                ? e.toLowerCase().includes(criterio.toLowerCase())
                                : e === criterio
                    )
                );
            }

            return value.some((criterio) =>
                typeof criterio === "string" && typeof propiedad === "string"
                    ? propiedad.toLowerCase().includes(criterio.toLowerCase())
                    : propiedad === criterio
            );
        }

        if (typeof value === "object" && value !== null) {
            return coincidePropiedad(propiedad, value);
        }

        if (typeof value === "string" && typeof propiedad === "string") {
            return propiedad.toLowerCase().includes(value.toLowerCase());
        }

        return propiedad === value;
    });
}