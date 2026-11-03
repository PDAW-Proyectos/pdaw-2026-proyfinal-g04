export const validarPaginacion = ({ pagina, limite }) => {
	pagina = Number(pagina ?? 1);
	limite = Number(limite ?? 10);

	if (
		!Number.isInteger(pagina) ||
		pagina < 1 ||
		!Number.isInteger(limite) ||
		limite < 1 ||
		limite > 50
	) {
		throw new Error("Paginación inválida");
	}
	return { pagina, limite }
};
