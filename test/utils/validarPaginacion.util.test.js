import { validarPaginacion } from "../../src/common/utils/validarPaginacion.util.js";

describe("validarPaginacicon", () => {
    test("valida correctamente la paginación con valores válidos", () => {
        // arrange
        const pagina = 2;
        const limite = 20;

        // act
        const resultado = validarPaginacion({ pagina, limite });

        // assert
        expect(resultado).toEqual({ pagina, limite });
    });

    test("lanza un error con valores inválidos", () => {
        // arrange
        const pagina = -1;
        const limite = 100;

        // act & assert
        expect(() => validarPaginacion({ pagina, limite })).toThrow("Paginación inválida");
    });

    test("asigna valores por defecto cuando no se proporcionan", () => {
        // act
        const resultado = validarPaginacion({});

        // assert
        expect(resultado).toEqual({ pagina: 1, limite: 10 });
    });
});
