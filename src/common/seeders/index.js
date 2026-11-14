import { crearSeeder } from "./seeder.factory.js";

try {
    const seeder = await crearSeeder();
    await seeder.ejecutar();
} catch (error) {
    console.error("Error al ejecutar el seeder:", error);
    process.exitCode = 1;
}