export class CotizacionService {
    cotizacionRepository;
    fetchFn

    constructor(cotizacionRepository, fetchFn = fetch) {
        this.cotizacionRepository = cotizacionRepository
        this.fetchFn = fetchFn
    }

    consultarCotizacion = async () => {
        const TRES_HORAS = 3 * 60 * 60 * 1000;
        const currentTime = new Date();
        const horaUTC = currentTime.getUTCHours();
        const dentroDelHorario = horaUTC >= 14 && horaUTC < 24;       
        const ultimaCotizacion = this.cotizacionRepository.listar().at(-1) 

        if (
            !this.cotizacionRepository?.ultimaConsulta || 
            (dentroDelHorario && currentTime.getTime() - this.cotizacionRepository.ultimaConsulta.getTime() > TRES_HORAS)
        ) {
            const response = await this.fetchFn('https://dolarapi.com/v1/dolares/blue');
            const data = await response.json()
            this.cotizacionRepository.ultimaConsulta = currentTime;
            const dataFecha = new Date(data.fechaActualizacion)
            const mismaFecha =
                ultimaCotizacion?.fechaActualizacion.getUTCFullYear() === dataFecha.getUTCFullYear() &&
                ultimaCotizacion?.fechaActualizacion.getUTCMonth() === dataFecha.getUTCMonth() &&
                ultimaCotizacion?.fechaActualizacion.getUTCDate() === dataFecha.getUTCDate();
            if(mismaFecha && data.venta === ultimaCotizacion.venta) {
                await this.cotizacionRepository.actualizar({...ultimaCotizacion, fechaActualizacion: data.fechaActualizacion })
            } else this.cotizacionRepository.crear(data)
        }
        return this.cotizacionRepository.listar().at(-1);
    }

    listarCotizaciones() {
        return this.cotizacionRepository.listar();
    }

    buscarCotizacion(id) {
        const cotizacion = this.cotizacionRepository.buscarPorId(id);

        if (!cotizacion) {
            const error = new Error("cotizacion no encontrada");
            error.status = 404;
            throw error;
        }

        return cotizacion;
    }
}