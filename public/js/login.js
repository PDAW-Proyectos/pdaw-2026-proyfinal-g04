document.addEventListener("DOMContentLoaded", () => {
  const loginCard = document.getElementById("loginCard");
  const roleButtons = document.querySelectorAll(".btn-role");
  const roleInput = document.getElementById("selected-role-input");
  const formSubtext = document.getElementById("form-subtext");
  const btnText = document.getElementById("btn-text");

  // Textos dinámicos para el formulario según el rol elegido
  const formTexts = {
    cajero: {
      instruction: "Ingresá a tu cuenta de <strong>Cajero</strong> para continuar.",
      button: "Iniciar como Cajero"
    },
    admin: {
      instruction: "Ingresá a tu cuenta de <strong>Administrador</strong> para continuar.",
      button: "Iniciar como Admin"
    },
    repositor: {
      instruction: "Ingresá a tu cuenta de <strong>Repositor</strong> para continuar.",
      button: "Iniciar como Repositor"
    }
  };


  roleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetRole = button.getAttribute("data-role");

      // Actualiza los botones
      // Quitamos la clase 'active' de TODOS los botones
      roleButtons.forEach(btn => btn.classList.remove("active"));
      
      //activa todos los botones que correspondan segun el rol
      const matchingButtons = document.querySelectorAll(`.btn-role[data-role="${targetRole}"]`);
      matchingButtons.forEach(btn => btn.classList.add("active"));

      //SWAP
      // Alterna de lado la card de vidrio cada vez que se cambia a un rol distinto
      loginCard.classList.toggle("swapped");

      // Cambio de vista del hero
      // Limpiamos las clases de rol previas en el contenedor principal
      loginCard.classList.remove("role-cajero", "role-admin", "role-repositor");
      loginCard.classList.add(`role-${targetRole}`);

      roleInput.value = targetRole;
      formSubtext.innerHTML = formTexts[targetRole].instruction;
      btnText.textContent = formTexts[targetRole].button;
    });
  });
});