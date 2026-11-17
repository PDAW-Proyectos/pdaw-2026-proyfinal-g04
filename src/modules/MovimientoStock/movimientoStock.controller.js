export class MovimientoStockController {
  constructor(movimientoStockService) {
    this.movimientoStockService = movimientoStockService;
  }

  listarMovimientos = async (req, res, next) => {
    try {
      const pagina = Number(req.query.pagina) || 1;
      const limite = Number(req.query.limite) || 10;

      const filtros = {};
      if (req.query.tipo) filtros.tipo = req.query.tipo;
      if (req.query.nombreProducto) filtros.nombreProducto = req.query.nombreProducto;

      const resultado = await this.movimientoStockService.listarMovimientos(pagina, limite, filtros);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}