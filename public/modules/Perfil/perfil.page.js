import {
  obtenerPerfilUsuario,
  actualizarDatosPerfil,
  cerrarSesionUsuario,
  cambiarPasswordUsuario
} from "./perfil.api.js";
import { confirmarAccion } from "../../common/utils/confirmar.js";

export async function iniciarPerfil() {
  const contenedor = document.getElementById("contenedor-perfil");
  if (!contenedor) return;

  let estadoOriginal = {
    nombre: "",
    apellido: "",
    email: "",
    rol: "Usuario",
  };

  // Estructura inspirada en las referencias 
  contenedor.innerHTML = `
    <div class="perfil-layout">
      <div class="perfil-header">
        <div>
          <h2>Mi Cuenta</h2>
          <p class="perfil-subtitulo">Administrá tu información personal y credenciales de acceso.</p>
        </div>
        <button type="button" id="btn-cerrar-sesion" class="btn-secundario-peligro">
          Cerrar Sesión
        </button>
      </div>

      <div class="perfil-grid-principal">
        <!-- Columna Izquierda: Formulario -->
        <form id="form-perfil-datos" class="perfil-card-form">
          
          <!-- Cabecera de avatar dentro del form -->
          <div class="perfil-avatar-row">
            <div id="perfil-avatar-circulo" class="perfil-avatar-circle">--</div>
            <div>
              <h4 id="perfil-titulo-cuenta" class="perfil-nombre-cabecera">Cargando...</h4>
              <span class="perfil-ayuda-texto">Avatar generado con tus iniciales</span>
            </div>
          </div>

          <hr class="perfil-separador" />

          <!-- Nombre y Apellido en 2 columnas -->
          <div class="perfil-fila-doble">
            <div class="modal-input-group">
              <label for="perfil-nombre">Nombre</label>
              <input type="text" id="perfil-nombre" required />
            </div>
            <div class="modal-input-group">
              <label for="perfil-apellido">Apellido</label>
              <input type="text" id="perfil-apellido" required />
            </div>
          </div>

          <!-- Email -->
          <div class="modal-input-group">
            <label for="perfil-email">Correo Electrónico</label>
            <input type="email" id="perfil-email" required />
            <span class="perfil-ayuda-texto">Usado para iniciar sesión en el sistema</span>
          </div>

          <hr class="perfil-separador" />

          <!-- Sección Contraseña Desplegable -->
          <div class="perfil-bloque-password">
            <div class="perfil-fila-accion">
              <div>
                <h4 class="perfil-label-bloque">Contraseña</h4>
                <p class="perfil-ayuda-texto">Actualizá tu clave de acceso periódicamente.</p>
              </div>
              <button type="button" id="btn-toggle-password" class="btn-outline-neutro">
                Cambiar Contraseña
              </button>
            </div>

            <!-- Panel desplegable oculto por defecto -->
            <div id="panel-cambiar-password" class="perfil-panel-password oculto">
              <div class="modal-input-group">
                <label for="perfil-pass-actual">Contraseña Actual</label>
                <input type="password" id="perfil-pass-actual" autocomplete="new-password" placeholder="Ingresá tu clave actual"" />
              </div>

              <div class="perfil-fila-doble">
                <div class="modal-input-group">
                  <label for="perfil-pass-nueva">Nueva Contraseña</label>
                  <input type="password" id="perfil-pass-nueva" autocomplete="new-password" />
                </div>
                <div class="modal-input-group">
                  <label for="perfil-pass-confirmar">Confirmar Nueva</label>
                  <input type="password" id="perfil-pass-confirmar" autocomplete="new-password" />
                </div>
              </div>

              <p id="password-feedback" class="perfil-feedback" role="status" aria-live="polite"></p>

              <div class="perfil-password-acciones">
                <button type="button" id="btn-cancelar-password" class="btn-outline-neutro">
                  Cancelar
                </button>
                <button type="button" id="btn-guardar-password" class="btn-primario">
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          </div>
          
          <p id="perfil-feedback" class="perfil-feedback" role="status" aria-live="polite"></p>

          <!-- Barra inferior tipo modal/referencia -->
          <div class="perfil-footer-acciones">
            <button type="button" id="btn-cancelar-perfil" class="btn-outline-neutro">Cancelar</button>
            <button type="submit" id="btn-guardar-perfil" class="btn-primario">Guardar Cambios</button>
          </div>
        </form>

        <!-- Columna Derecha: Tarjeta Preview en vivo -->
        <aside class="perfil-card-preview">
          <span class="perfil-preview-tag">Vista Previa</span>
          <div id="preview-avatar" class="perfil-avatar-circle grande">--</div>
          <h3 id="preview-nombre-completo" class="preview-nombre">---</h3>
          <span id="preview-rol-badge" class="perfil-rol-pill">---</span>
          <p id="preview-email" class="preview-email">---</p>
        </aside>
      </div>
    </div>
  `;

  // Referencias DOM
  const inputNombre = document.getElementById("perfil-nombre");
  const inputApellido = document.getElementById("perfil-apellido");
  const inputEmail = document.getElementById("perfil-email");
  const feedback = document.getElementById("perfil-feedback");
  const formDatos = document.getElementById("form-perfil-datos");
  const btnGuardar = document.getElementById("btn-guardar-perfil");
  const btnCancelar = document.getElementById("btn-cancelar-perfil");
  const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

  // Elementos visuales a actualizar
  const avatarForm = document.getElementById("perfil-avatar-circulo");
  const tituloCuenta = document.getElementById("perfil-titulo-cuenta");
  const previewAvatar = document.getElementById("preview-avatar");
  const previewNombre = document.getElementById("preview-nombre-completo");
  const previewRol = document.getElementById("preview-rol-badge");
  const previewEmail = document.getElementById("preview-email");

  function obtenerIniciales(nombre, apellido) {
    const n = (nombre || "").trim().charAt(0).toUpperCase();
    const a = (apellido || "").trim().charAt(0).toUpperCase();
    return n + a || "US";
  }

  // Actualiza tanto el preview derecho como la cabecera en tiempo real
  function sincronizarVistaPrevia() {
    const nom = inputNombre.value.trim();
    const ape = inputApellido.value.trim();
    const mail = inputEmail.value.trim();
    const completo = `${nom} ${ape}`.trim() || "Sin nombre";
    const iniciales = obtenerIniciales(nom, ape);

    if (avatarForm) avatarForm.textContent = iniciales;
    if (previewAvatar) previewAvatar.textContent = iniciales;
    if (tituloCuenta) tituloCuenta.textContent = completo;
    if (previewNombre) previewNombre.textContent = completo;
    if (previewEmail) previewEmail.textContent = mail || "sin-email@kchin.com";
    if (previewRol) previewRol.textContent = estadoOriginal.rol;
  }

  function volcarDatosEnFormulario(datos) {
    inputNombre.value = datos.nombre;
    inputApellido.value = datos.apellido;
    inputEmail.value = datos.email;
    sincronizarVistaPrevia();
  }

  function mostrarMensaje(texto, tipo = "") {
    if (!feedback) return;
    feedback.textContent = texto;
    feedback.className = "perfil-feedback";
    if (tipo === "error") feedback.classList.add("es-error");
    if (tipo === "exito") feedback.classList.add("es-exito");
  }

  // Cargar datos iniciales (GET /api/auth/me)
  try {
    const respuesta = await obtenerPerfilUsuario();
    const usuario = respuesta?.usuario || respuesta?.user || respuesta || {};

    estadoOriginal = {
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      rol: usuario.rol || usuario.role || "Usuario",
    };

    volcarDatosEnFormulario(estadoOriginal);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    mostrarMensaje(
      error.message || "No se pudieron cargar los datos del perfil.",
      "error",
    );
  }

  inputNombre?.addEventListener("input", sincronizarVistaPrevia);
  inputApellido?.addEventListener("input", sincronizarVistaPrevia);
  inputEmail?.addEventListener("input", sincronizarVistaPrevia);

  // Botón Cancelar
  btnCancelar?.addEventListener("click", () => {
    volcarDatosEnFormulario(estadoOriginal);
    mostrarMensaje("Cambios descartados.");
  });

  // Guardar cambios nombre, apellido y email)
  formDatos?.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarMensaje("");

    const payload = {
      nombre: inputNombre.value.trim(),
      apellido: inputApellido.value.trim(),
      email: inputEmail.value.trim(),
    };

    if (!payload.nombre || !payload.apellido || !payload.email) {
      mostrarMensaje(
        "Completá nombre, apellido y email antes de guardar.",
        "error",
      );
      return;
    }

    const confirmado = await confirmarAccion({
      titulo: "Guardar cambios",
      mensaje: "¿Confirmás guardar los cambios de tu perfil?",
      textoConfirmar: "Sí, guardar",
    });
    if (!confirmado) return;

    try {
      btnGuardar.disabled = true;
      const respuestaActualizada = await actualizarDatosPerfil(payload);
      const usuarioActualizado =
        respuestaActualizada?.usuario ||
        respuestaActualizada?.user ||
        respuestaActualizada ||
        payload;

      estadoOriginal = {
        ...estadoOriginal,
        nombre: usuarioActualizado.nombre ?? payload.nombre,
        apellido: usuarioActualizado.apellido ?? payload.apellido,
        email: usuarioActualizado.email ?? payload.email,
      };

      volcarDatosEnFormulario(estadoOriginal);
      mostrarMensaje("Perfil actualizado correctamente.", "exito");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      mostrarMensaje(
        error.message || "Ocurrió un error al guardar los cambios.",
        "error",
      );
    } finally {
      btnGuardar.disabled = false;
    }
  });

  // Cerrar sesión
  btnCerrarSesion?.addEventListener("click", async () => {
    const confirmado = await confirmarAccion({
      titulo: "Cerrar sesión",
      mensaje: "¿Seguro que querés cerrar tu sesión?",
      textoConfirmar: "Cerrar sesión",
      peligro: true,
    });
    if (!confirmado) return;

    try {
      await cerrarSesionUsuario();
      window.location.href = "/login.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarMensaje(error.message || "No se pudo cerrar la sesión.", "error");
    }
  });

  // Referencias del panel de contraseña
  const btnTogglePass = document.getElementById("btn-toggle-password");
  const panelPass = document.getElementById("panel-cambiar-password");
  const inputPassActual = document.getElementById("perfil-pass-actual");
  const inputPassNueva = document.getElementById("perfil-pass-nueva");
  const inputPassConfirmar = document.getElementById("perfil-pass-confirmar");
  const passFeedback = document.getElementById("password-feedback");
  const btnCancelarPass = document.getElementById("btn-cancelar-password");
  const btnGuardarPass = document.getElementById("btn-guardar-password");

  function mostrarMensajePass(texto, tipo = "") {
    if (!passFeedback) return;
    passFeedback.textContent = texto;
    passFeedback.className = "perfil-feedback";
    if (tipo === "error") passFeedback.classList.add("es-error");
    if (tipo === "exito") passFeedback.classList.add("es-exito");
  }

  function cerrarYLimpiarPanelPass() {
    panelPass?.classList.add("oculto");
    if (btnTogglePass) btnTogglePass.textContent = "Cambiar Contraseña";
    if (inputPassActual) inputPassActual.value = "";
    if (inputPassNueva) inputPassNueva.value = "";
    if (inputPassConfirmar) inputPassConfirmar.value = "";
    mostrarMensajePass("");
  }

  btnTogglePass?.addEventListener("click", () => {
    const estaOculto = panelPass.classList.toggle("oculto");
    btnTogglePass.textContent = estaOculto ? "Cambiar Contraseña" : "Cerrar";
    if (estaOculto) cerrarYLimpiarPanelPass();
  });

  btnCancelarPass?.addEventListener("click", cerrarYLimpiarPanelPass);

  btnGuardarPass?.addEventListener("click", async () => {
    mostrarMensajePass("");

    const actual = inputPassActual.value;
    const nueva = inputPassNueva.value;
    const confirmar = inputPassConfirmar.value;

    if (!actual || !nueva || !confirmar) {
      mostrarMensajePass("Completá los tres campos de contraseña.", "error");
      return;
    }

    if (nueva.length < 6) {
      mostrarMensajePass("La nueva contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    if (nueva !== confirmar) {
      mostrarMensajePass("La nueva contraseña y su confirmación no coinciden.", "error");
      return;
    }

    const confirmado = await confirmarAccion({
      titulo: "Actualizar contraseña",
      mensaje: "¿Confirmás actualizar tu contraseña?",
      textoConfirmar: "Sí, actualizar",
    });
    if (!confirmado) return;

    try {
      btnGuardarPass.disabled = true;
      await cambiarPasswordUsuario({
        passwordActual: actual,
        passwordNueva: nueva,
      });

      cerrarYLimpiarPanelPass();
      mostrarMensaje("Contraseña actualizada correctamente.", "exito");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      mostrarMensajePass(error.message || "No se pudo actualizar la contraseña.", "error");
    } finally {
      btnGuardarPass.disabled = false;
    }
  });
}
