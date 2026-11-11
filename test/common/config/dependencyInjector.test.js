import { DependencyInjector } from "../../../src/common/config/dependencyInjector.js";

describe('DependencyInjector', () => {
    let dependencyInjector;

    beforeEach(() => {
        dependencyInjector = new DependencyInjector();
    });

    test('lanza un error si el token no está registrado', async () => {
        await expect(dependencyInjector.resolve('Desconocido'))
            .rejects.toThrow('No registration for "Desconocido"');
    });

    test('resuelve una dependencia transient con instancias diferentes', async () => {
        let counter = 0;
        dependencyInjector.registerTransient('Contador', () => ++counter);

        const inst1 = await dependencyInjector.resolve('Contador');
        const inst2 = await dependencyInjector.resolve('Contador');

        expect(inst1).toBe(1);
        expect(inst2).toBe(2);
    });

    test('resuelve una dependencia singleton devolviendo la misma instancia', async () => {
        let counter = 0;
        dependencyInjector.registerSingleton('Contador', () => ++counter);

        const inst1 = await dependencyInjector.resolve('Contador');
        const inst2 = await dependencyInjector.resolve('Contador');

        expect(inst1).toBe(1);
        expect(inst2).toBe(1);
    });

    test('resuelve un singleton correctamente ante llamadas concurrentes (race conditions)', async () => {
        let ejecucionesFactory = 0;
        
        dependencyInjector.registerSingleton('ServicioLento', async () => {
            ejecucionesFactory++;
            return new Promise(resolve => setTimeout(() => resolve('Ok'), 20));
        });

        const [res1, res2, res3] = await Promise.all([
            dependencyInjector.resolve('ServicioLento'),
            dependencyInjector.resolve('ServicioLento'),
            dependencyInjector.resolve('ServicioLento')
        ]);

        expect(res1).toBe('Ok');
        expect(res2).toBe('Ok');
        expect(res3).toBe('Ok');
        expect(ejecucionesFactory).toBe(1);
    });
});