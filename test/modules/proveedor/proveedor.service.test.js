import { jest } from "@jest/globals";
import { ProveedorService } from "../../../src/modules/proveedor/proveedor.service.js";
import { NotFoundError } from "../../../src/common/errors/errors.classes.js";

describe("ProveedorService", () => {
    let service;
    let repository;

    beforeEach(() => {
        repository = {
            listar: jest.fn(),
            buscarPorId: jest.fn(),
            crear: jest.fn(),
            actualizar: jest.fn(),
            eliminar: jest.fn(),
        };
        service = new ProveedorService(repository);
    });

    it("devuelve proveedores con metadatos de paginación", () => {
        repository.listar.mockReturnValue({
            datos: [{ id: 1, empresa: "Distribuidora" }],
            total: 1,
            pagina: 1,
            limite: 10,
            totalPaginas: 1,
        });

        expect(service.listarProveedores(1, 10)).toEqual({
            proveedores: [{ id: 1, empresa: "Distribuidora" }],
            total: 1,
            pagina: 1,
            limite: 10,
            totalPaginas: 1,
        });
    });

    it("actualiza solo los campos enviados y falla si el proveedor no existe", async () => {
        const anterior = { id: 1, empresa: "Distribuidora", estado: "Activo" };
        repository.buscarPorId.mockReturnValue(anterior);
        repository.actualizar.mockResolvedValue({ ...anterior, telefono: "291-555-0101" });

        await service.actualizarProveedor(1, { telefono: "291-555-0101" });

        expect(repository.actualizar).toHaveBeenCalledWith({
            ...anterior,
            telefono: "291-555-0101",
        });

        repository.buscarPorId.mockReturnValue(null);
        await expect(service.actualizarProveedor(2, {})).rejects.toThrow(NotFoundError);
    });
});
