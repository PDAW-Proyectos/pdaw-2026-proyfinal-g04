const formTexts = {
    cajero: {
        instruction: "Ingresá a tu cuenta de <strong>Cajero</strong> para continuar.",
        button: "Iniciar como Cajero",
    },
    admin: {
        instruction: "Ingresá a tu cuenta de <strong>Administrador</strong> para continuar.",
        button: "Iniciar como Admin",
    },
    repositor: {
        instruction: "Ingresá a tu cuenta de <strong>Repositor</strong> para continuar.",
        button: "Iniciar como Repositor",
    },
};

export function iniciarSelectorRol() {
    const loginCard = document.getElementById("loginCard");
    const roleButtons = document.querySelectorAll(".btn-role");
    const roleInput = document.getElementById("selected-role-input");
    const formSubtext = document.getElementById("form-subtext");
    const btnText = document.getElementById("btn-text");

    roleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetRole = button.getAttribute("data-role");

            if (roleInput.value === targetRole) return;

            roleInput.value = targetRole;
            roleButtons.forEach((btn) => btn.classList.remove("active"));

            document.querySelectorAll(`.btn-role[data-role="${targetRole}"]`).forEach((btn) => btn.classList.add("active"));

            loginCard.classList.toggle("swapped");
            loginCard.classList.remove("role-cajero", "role-admin", "role-repositor");
            loginCard.classList.add(`role-${targetRole}`);

            formSubtext.innerHTML = formTexts[targetRole].instruction;
            btnText.textContent = formTexts[targetRole].button;
        });
    });

    return {
        obtenerRol: () => roleInput?.value || "cajero",
    };
}
