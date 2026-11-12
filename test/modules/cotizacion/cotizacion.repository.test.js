import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CotizacionRepository } from "../../../src/modules/cotizacion/cotizacion.repository.js";

describe("CotizacionRepository", () => {
    let tempDir;
    let repoPath;
    
    const mockFactory = (data) => ({ ...data, _instanciado: true });

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "test-cotizacion-"));
        repoPath = join(tempDir, "db.json");
    });

    test("inicializar() inicializa un repositorio con la ruta, factory especificados y carga el archivo vacío", async () => {
        const repo = await CotizacionRepository.inicializar(repoPath, mockFactory);
        
        expect(repo).toBeInstanceOf(CotizacionRepository);
        expect(repo.ruta).toBe(repoPath);
        expect(repo.factory).toBe(mockFactory);
        expect(repo.entidades).toEqual([]);
        expect(repo.ultimaConsulta).toBeUndefined();
    });

    test("get y set de ultimaConsulta funcionan correctamente", () => {
        const repo = new CotizacionRepository(repoPath, mockFactory);
        const fecha = new Date("2026-10-01T10:00:00.000Z");
        
        repo.ultimaConsulta = fecha;
        
        expect(repo.ultimaConsulta).toEqual(fecha);
    });

    test("guardar() persiste la estructura personalizada (ultimaConsulta y entidades) en disco", async () => {
        const repo = new CotizacionRepository(repoPath, mockFactory);
        const fecha = new Date("2026-10-01T10:00:00.000Z");
        repo.ultimaConsulta = fecha;
        repo.entidades = [{ id: 1, moneda: "USD", _instanciado: true }];
        
        await repo.guardar();

        const archivoGuardado = JSON.parse(await readFile(repoPath, "utf8"));
        expect(archivoGuardado).toHaveProperty("ultimaConsulta", fecha.toISOString());
        expect(archivoGuardado).toHaveProperty("entidades");
        expect(archivoGuardado.entidades[0].id).toBe(1);
    });

    test("cargar() lee la estructura personalizada y restaura el estado del repositorio", async () => {
        const fechaString = "2026-10-01T10:00:00.000Z";
        const datosPersistidos = {
            ultimaConsulta: fechaString,
            entidades: [
                { id: 1, moneda: "USD" },
                { id: 2, moneda: "EUR" }
            ]
        };
        await writeFile(repoPath, JSON.stringify(datosPersistidos), "utf8");
        const repo = new CotizacionRepository(repoPath, mockFactory);

        await repo.cargar();
        
        expect(repo.ultimaConsulta).toBeInstanceOf(Date);
        expect(repo.ultimaConsulta.toISOString()).toBe(fechaString);
        expect(repo.entidades.length).toBe(2);
        expect(repo.entidades[0]._instanciado).toBe(true);
        expect(repo.entidades[1]._instanciado).toBe(true);
        expect(repo.proximoId).toBe(3);
    });

    test("cargar() establece ultimaConsulta en null si no existe en el archivo JSON", async () => {
        const datosPersistidos = {
            entidades: [{ id: 5 }]
        };
        await writeFile(repoPath, JSON.stringify(datosPersistidos), "utf8");
        
        const repo = new CotizacionRepository(repoPath, mockFactory);
        await repo.cargar();
        
        expect(repo.ultimaConsulta).toBeNull();
        expect(repo.proximoId).toBe(6);
    });

    test("cargar() no arroja error si el archivo no existe (ENOENT)", async () => {
        const repo = new CotizacionRepository(repoPath, mockFactory);
        
        await expect(repo.cargar()).resolves.not.toThrow();
        
        expect(repo.ultimaConsulta).toBeUndefined();
    });

    test("una segunda instancia con la misma ruta recupera correctamente las entidades y la ultimaConsulta", async () => {
        const repo1 = await CotizacionRepository.inicializar(repoPath, mockFactory);
        const fecha = new Date("2026-10-01T10:00:00.000Z");
        repo1.ultimaConsulta = fecha;
        await repo1.crear({ moneda: "USD", venta: 1000 }); 
        
        const repo2 = await CotizacionRepository.inicializar(repoPath, mockFactory);
        
        expect(repo2.ultimaConsulta).toEqual(fecha);
        expect(repo2.listar(1, 10).datos.length).toBe(1);
        expect(repo2.listar(1, 10).datos[0].moneda).toBe("USD");
        expect(repo2.listar(1, 10).datos[0]._instanciado).toBe(true);
    });
});