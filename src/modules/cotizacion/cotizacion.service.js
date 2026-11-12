import {
  ExternalServiceError,
} from "../../common/errors/errors.classes.js";

export class CotizacionService {
  cotizacionRepository;
  fetchFn;

  constructor(cotizacionRepository, fetchFn = fetch) {
    this.cotizacionRepository = cotizacionRepository;
    this.fetchFn = fetchFn;
  }

  consultarCotizacion = async () => {
    const TRES_HORAS = 3 * 60 * 60 * 1000;
    const currentTime = new Date();
    const horaUTC = currentTime.getUTCHours();
    const dentroDelHorario = horaUTC >= 14 && horaUTC < 20;
    const ultimaCotizacion = this.cotizacionRepository.listar().datos.at(-1);
    let cotizacion = ultimaCotizacion;

    const debeConsultar =
      !this.cotizacionRepository?.ultimaConsulta ||
      (dentroDelHorario &&
        currentTime.getTime() -
          this.cotizacionRepository.ultimaConsulta.getTime() >
          TRES_HORAS);

    if (debeConsultar) {
      let data;

      // Consultar DolarAPI y manejar exclusivamente sus errores.
      try {
        const response = await this.fetchFn(
          "https://dolarapi.com/v1/dolares/blue",
        );

        if (!response.ok) {
          throw new Error(`DolarAPI respondió con HTTP ${response.status}`);
        }

        data = await response.json();

        if (
          !data ||
          typeof data.venta !== "number" ||
          !data.fechaActualizacion
        ) {
          throw new Error("DolarAPI devolvió datos inválidos");
        }
      } catch (error) {
        throw new ExternalServiceError("DolarAPI", error);
      }

      const dataFecha = new Date(data.fechaActualizacion);
      const ultimaFecha = ultimaCotizacion
        ? new Date(ultimaCotizacion.fechaActualizacion)
        : null;

      const mismaFecha =
        ultimaFecha &&
        ultimaFecha.getUTCFullYear() === dataFecha.getUTCFullYear() &&
        ultimaFecha.getUTCMonth() === dataFecha.getUTCMonth() &&
        ultimaFecha.getUTCDate() === dataFecha.getUTCDate();

      if (mismaFecha && data.venta === ultimaCotizacion.venta) {
        cotizacion = await this.cotizacionRepository.actualizar({
          ...ultimaCotizacion,
          fechaActualizacion: data.fechaActualizacion,
        });
      } else {
        this.cotizacionRepository.ultimaConsulta = currentTime;
        cotizacion = await this.cotizacionRepository.crear(data);
      }
    }

    return {
      cotizacion
    };
  };

  async listarCotizaciones(pagina, limite) {
    const { datos, ...paginacion } = this.cotizacionRepository.listar(
      pagina,
      limite,
    );
    return {
      cotizacion: datos,
      ...paginacion,
    };
  }

  buscarCotizacion(id) {
    if (!id) {
      return this.cotizacionRepository.entidades.at(-1);
    }
    const cotizacion = this.cotizacionRepository.buscarPorId(id);
    if (!cotizacion) {
      return this.cotizacionRepository.entidades.at(-1);
    }
    return cotizacion;
  }
}
