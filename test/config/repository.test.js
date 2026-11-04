import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Repository } from "../../src/common/config/repository.js";

describe("Repository", () => {
    let tempDir;
    let repoPath;
    
    // Un factory de prueba simple que inyecta una propiedad para verificar su uso
    const mockFactory = (data) => ({ ...data, _instanciado: true });

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "test-"));
        repoPath = join(tempDir, "db.json");
    });

    test("el constructor arroja TypeError si la ruta es nula", () => {
        expect(() => new Repository(null, mockFactory)).toThrow(TypeError);
    });

    test("inicializar() inicializa un repositorio con la ruta, factory especificados y carga el archivo", async () => {
        const repo = await Repository.inicializar(repoPath, mockFactory);
        expect(repo).toBeInstanceOf(Repository);
        expect(repo.ruta).toBe(repoPath);
        expect(repo.factory).toBe(mockFactory);
        expect(repo.entidades).toEqual([]);
    });

    test("una segunda instancia con la misma ruta recupera lo que la primera guardó", async () => {
        const repo1 = await Repository.inicializar(repoPath, mockFactory);
        const entidad = await repo1.crear({ nombre: "Uno", tipo: "A" });

        const repo2 = await Repository.inicializar(repoPath, mockFactory);
        const entidadesRepo2 = repo2.listar();
        
        expect(entidadesRepo2).toEqual([entidad]);
    });

    test("crear() asigna un ID, utiliza el factory y guarda la entidad", async () => {
        const repo = new Repository(repoPath, mockFactory);
        const nuevaEntidad = { nombre: "Test" };
        
        const resultado = await repo.crear(nuevaEntidad);
        
        expect(resultado.id).toBe(1);
        expect(resultado._instanciado).toBe(true);
        expect(repo.listar().length).toBe(1);
    });

    test("buscarPorId() y buscarPorPropiedad() devuelven la entidad correcta", async () => {
        const repo = new Repository(repoPath, mockFactory);
        await repo.crear({ nombre: "Uno", tipo: "A" });
        await repo.crear({ nombre: "Dos", tipo: "B" });

        const porId = repo.buscarPorId(2);
        expect(porId.id).toBe(2);

        const porPropiedad = repo.buscarPorPropiedad({ tipo: "A" });
        expect(porPropiedad.id).toBe(1);
    });

    test("actualizar() modifica una entidad existente y guarda los cambios", async () => {
        const repo = new Repository(repoPath, mockFactory);
        const entidad = await repo.crear({ nombre: "Original" });
        
        entidad.nombre = "Modificado";
        const actualizada = await repo.actualizar(entidad);
        
        expect(actualizada).toEqual(entidad);
    });

    test("eliminar() remueve la entidad si existe y devuelve true", async () => {
        const repo = new Repository(repoPath, mockFactory);
        await repo.crear({ nombre: "Eliminar" });
        
        const resultado = await repo.eliminar(1);
        expect(resultado).toBe(true);
        expect(repo.listar().length).toBe(0);
    });

    test("eliminar() devuelve false si el ID no existe", async () => {
        const repo = new Repository(repoPath, mockFactory);
        const resultado = await repo.eliminar(99);
        expect(resultado).toBe(false);
    });

    describe("Transacciones", () => {
        test("iniciarTransaccion() evita que se guarde en disco al crear", async () => {
            const repo = new Repository(repoPath, mockFactory);
            repo.iniciarTransaccion();
            
            await repo.crear({ nombre: "Transaccion" });
            
            // La entidad está en memoria
            expect(repo.listar().length).toBe(1);
            
            // Pero NO está en disco porque la transacción no se confirmó
            await expect(readFile(repoPath, "utf8")).rejects.toThrow("ENOENT");
        });

        test("confirmarTransaccion() persiste los cambios en disco", async () => {
            const repo = new Repository(repoPath, mockFactory);
            // Primero creamos el archivo vacío para evitar ENOENT en la prueba base
            await repo.guardar(); 
            
            repo.iniciarTransaccion();
            await repo.crear({ nombre: "Confirmado" });
            await repo.confirmarTransaccion();
            
            const archivo = JSON.parse(await readFile(repoPath, "utf8"));
            expect(archivo.length).toBe(1);
            expect(archivo[0].nombre).toBe("Confirmado");
        });

        test("rollback() revierte el estado al punto anterior a la transacción", async () => {
            const repo = new Repository(repoPath, mockFactory);
            await repo.crear({ nombre: "Base" }); // id: 1
            
            repo.iniciarTransaccion();
            await repo.crear({ nombre: "A revertir" }); // id: 2
            expect(repo.listar().length).toBe(2);
            
            await repo.rollback();
            
            expect(repo.listar().length).toBe(1);
            expect(repo.proximoId).toBe(2); // Se revierte al id esperado
            expect(repo.buscarPorId(1).nombre).toBe("Base");
        });

        test("iniciarTransaccion() lanza error si ya hay una transacción activa", () => {
            const repo = new Repository(repoPath, mockFactory);
            repo.iniciarTransaccion();
            expect(() => repo.iniciarTransaccion()).toThrow("Ya existe una transacción activa");
        });
    });
});