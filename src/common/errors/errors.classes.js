
export class AppError extends Error {
    constructor(message, options = {}) {
        const {
            status = 500,
            title = "Error interno",
            details,
            cause
        } = options;
        super(message, { cause });
        this.name = this.constructor.name;
        Object.assign(this, { status, title, details });
    }
}

// 400 - Solicitud incorrecta
export class BadRequestError extends AppError {
    constructor(message = "Solicitud incorrecta", details) {
        super(message, {
            status: 400,
            title: "Solicitud incorrecta",
            details
        });
    }
}

// 401 - No autenticado
export class UnauthorizedError extends AppError {
    constructor(message = "No autenticado") {
        super(message, {
            status: 401,
            title: "No autorizado"
        });
    }
}

// 403 - Sin permisos
export class ForbiddenError extends AppError {
    constructor(message = "No tenés permisos para realizar esta operación") {
        super(message, {
            status: 403,
            title: "Acceso prohibido"
        });
    }
}

// 404 - Recurso inexistente
export class NotFoundError extends AppError {
    constructor(what = "Recurso") {
        super(`${what} no encontrado`, {
            status: 404,
            title: "No encontrado"
        });
    }
}

// 409 - Conflicto
export class ConflictError extends AppError {
    constructor(message = "Conflicto con el estado actual del recurso") {
        super(message, {
            status: 409,
            title: "Conflicto"
        });
    }
}

// 422 - Entidad no procesable
export class UnprocessableEntityError extends AppError {
    constructor(message = "No se pudieron procesar los datos", details) {
        super(message, {
            status: 422,
            title: "Entidad no procesable",
            details
        });
    }
}

// 429 - Demasiadas solicitudes
export class TooManyRequestsError extends AppError {
    constructor(message = "Demasiadas solicitudes") {
        super(message, {
            status: 429,
            title: "Demasiadas solicitudes"
        });
    }
}

// 502 - Servicio externo no disponible
export class ExternalServiceError extends AppError {
    constructor(service, cause) {
        super(`Servicio ${service} no disponible`, {
            status: 502,
            title: "Error en servicio externo",
            cause
        });
    }
}
