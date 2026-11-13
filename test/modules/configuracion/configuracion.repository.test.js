import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfiguracionRepository } from "../../../src/modules/configuracion/configuracion.repository.js";

describe("ConfiguracionRepository", () => {
    let tempDir;
    let repoPath;
    const mockFactory = (data) => ({ ...data, _instanciado: true });

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "test-configuracion-"));
        repoPath = join(tempDir, "db.json");
    });

    test("inicializar() inicializa un repositorio con la ruta y factory especificados", async () => {
        const repo = await ConfiguracionRepository.inicializar(repoPath, mockFactory);
        
        expect(repo).toBeInstanceOf(ConfiguracionRepository);
        expect(repo.ruta).toBe(repoPath);
        expect(repo.factory).toBe(mockFactory);
        expect(repo.entidades).toEqual([]);
        expect(repo.configuracion).toBeUndefined(); 
    });

    test("actualizarConfiguracion() actualiza duracionHoras y guarda automáticamente en disco", async () => {
        await writeFile(repoPath, JSON.stringify({ 
            configuracion: { duracionHoras: 24 }, 
            entidades: [] 
        }), "utf8");
        const repo = await ConfiguracionRepository.inicializar(repoPath, mockFactory);
        
        await repo.actualizarConfiguracion({ duracionHoras: 12 });
        
        expect(repo.configuracion).toEqual({ duracionHoras: 12 });
        const archivoGuardado = JSON.parse(await readFile(repoPath, "utf8"));
        expect(archivoGuardado.configuracion).toEqual({ duracionHoras: 12 });
    });

    test("guardar() persiste tanto la configuracion en memoria como las entidades", async () => {
        await writeFile(repoPath, JSON.stringify({ 
            configuracion: { duracionHoras: 8 }, 
            entidades: [] 
        }), "utf8");
        const repo = await ConfiguracionRepository.inicializar(repoPath, mockFactory);
        repo.entidades = [{ id: 1, nombre: "Admin", _instanciado: true }];
        await repo.guardar();

        const archivoGuardado = JSON.parse(await readFile(repoPath, "utf8"));
        expect(archivoGuardado.configuracion.duracionHoras).toBe(8);
        expect(archivoGuardado.entidades.length).toBe(1);
        expect(archivoGuardado.entidades[0].id).toBe(1);
    });

    test("cargar() lee la estructura y restaura la configuración de duracionHoras y las entidades", async () => {
        const datosPersistidos = {
            configuracion: { duracionHoras: 48 },
            entidades: [
                { id: 1, rol: "admin" },
                { id: 2, rol: "user" }
            ]
        };
        await writeFile(repoPath, JSON.stringify(datosPersistidos), "utf8");
        const repo = new ConfiguracionRepository(repoPath, mockFactory);

        await repo.cargar();
        
        expect(repo.configuracion).toEqual(datosPersistidos.configuracion);
        expect(repo.entidades.length).toBe(2);
        expect(repo.entidades[0]._instanciado).toBe(true);
        expect(repo.proximoId).toBe(3);
    });

    test("cargar() establece configuracion por defecto si el JSON existe pero no incluye el atributo 'configuracion'", async () => {
        const datosPersistidos = {
            entidades: [{ id: 10 }]
        };
        await writeFile(repoPath, JSON.stringify(datosPersistidos), "utf8");
        
        const repo = new ConfiguracionRepository(repoPath, mockFactory);
        await repo.cargar();
        
        expect(repo.configuracion).toEqual({ sessionExpiringTime: 28800000 });
        expect(repo.proximoId).toBe(11);
    });

    test("cargar() no arroja error si el archivo no existe (ENOENT) y deja atributos por defecto", async () => {
        const repo = new ConfiguracionRepository(repoPath, mockFactory);
        
        await expect(repo.cargar()).resolves.not.toThrow();
        
        expect(repo.configuracion).toBeUndefined();
        expect(repo.entidades).toEqual([]); 
    });

    test("una segunda instancia con la misma ruta recupera correctamente duracionHoras y las entidades", async () => {
        const repo1 = await ConfiguracionRepository.inicializar(repoPath, mockFactory);
        await repo1.actualizarConfiguracion({ duracionHoras: 72 });
        await repo1.crear({ param: "test1" }); 
        
        const repo2 = await ConfiguracionRepository.inicializar(repoPath, mockFactory);
        
        expect(repo2.configuracion).toEqual({ duracionHoras: 72 });
        const resultadoListar = repo2.listar(1, 10);
        expect(resultadoListar.datos.length).toBe(1);
        expect(resultadoListar.datos[0].param).toBe("test1");
        expect(resultadoListar.datos[0]._instanciado).toBe(true);
    });
});