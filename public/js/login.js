lucide.createIcons();
document.addEventListener("DOMContentLoaded", () => {
  const loginCard = document.getElementById("loginCard");
  const roleButtons = document.querySelectorAll(".btn-role");
  const roleInput = document.getElementById("selected-role-input");
  const formSubtext = document.getElementById("form-subtext");
  const btnText = document.getElementById("btn-text");

  // Elementos del formulario
  const authForm = document.getElementById("auth-form");
  const mensajeError = document.getElementById("mensaje-login");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const mostrarContrasena = document.getElementById("mostrar-contrasena");


  //Boton mostrar/ocultar contraseña

  mostrarContrasena.addEventListener("click", () => {
    const mostrar = passwordInput.type === "password";

    passwordInput.type = mostrar ? "text" : "password";
    mostrarContrasena.setAttribute(
      "aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña",
    );

    mostrarContrasena.innerHTML = `<i data-lucide="${mostrar ? "eye-off" : "eye"}" aria-hidden="true"></i>`;
    lucide.createIcons();
  })

  // Textos dinámicos para el formulario según el rol elegido
  const formTexts = {
    cajero: {
      instruction:
        "Ingresá a tu cuenta de <strong>Cajero</strong> para continuar.",
      button: "Iniciar como Cajero",
    },
    admin: {
      instruction:
        "Ingresá a tu cuenta de <strong>Administrador</strong> para continuar.",
      button: "Iniciar como Admin",
    },
    repositor: {
      instruction:
        "Ingresá a tu cuenta de <strong>Repositor</strong> para continuar.",
      button: "Iniciar como Repositor",
    },
  };

  // 1. Alternancia de paneles y animación visual
  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetRole = button.getAttribute("data-role");

      if (roleInput.value === targetRole) return;

      roleInput.value = targetRole;

      // Actualiza los botones
      // Quitamos la clase 'active' de TODOS los botones
      roleButtons.forEach((btn) => btn.classList.remove("active"));

      //activa todos los botones que correspondan segun el rol
      const matchingButtons = document.querySelectorAll(
        `.btn-role[data-role="${targetRole}"]`,
      );
      matchingButtons.forEach((btn) => btn.classList.add("active"));

      //SWAP
      // Alterna de lado la card de vidrio cada vez que se cambia a un rol distinto
      loginCard.classList.toggle("swapped");

      // Cambio de vista del hero
      // Limpiamos las clases de rol previas en el contenedor principal
      loginCard.classList.remove("role-cajero", "role-admin", "role-repositor");
      loginCard.classList.add(`role-${targetRole}`);

      formSubtext.innerHTML = formTexts[targetRole].instruction;
      btnText.textContent = formTexts[targetRole].button;
    });
  });

  // 2. ENVÍO REAL AL BACKEND (Lo que faltaba)
  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Evita recargar la página

      if (mensajeError) mensajeError.textContent = "";

      const email = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const rolSeleccionado = roleInput ? roleInput.value : "cajero";

      try {
        const respuesta = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, requestedRole: rolSeleccionado }),
        });

        // Dentro del submit en public/Login.js:
        const data = await respuesta.json();

        if (!respuesta.ok) {
          if (mensajeError) {
            mensajeError.textContent =
              data.error || "No tenés permisos para ingresar a esta área";
          }
          return;
        }

        if (data.rol === "cajero" && rolSeleccionado === "cajero") {
          window.location.href = "/caja.html";
          return;
        }

        if (data.rol === "repositor" && rolSeleccionado === "repositor") {
          window.location.href = "/index.html";
          return;
        }

        if (data.rol === "admin") {
          // El admin va a la sección que tenía seleccionada en el formulario
          if (rolSeleccionado === "cajero") {
            window.location.href = "/caja.html";
          } else if (rolSeleccionado === "repositor") {
            window.location.href = "/index.html";
          } else {
            window.location.href = "/admin.html";
          }
        }
      } catch (err) {
        if (mensajeError) {
          mensajeError.textContent = "Error al conectar con el servidor";
        }
      }
    });
  }
});
