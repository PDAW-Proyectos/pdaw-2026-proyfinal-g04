export function generarCodigoBarrasFalso(id) {
  const idNormalizado = String(id ?? "")
    .replace(/\D/g, "")
    .padStart(10, "0")
    .slice(-10);

  return `779${idNormalizado}`;
}

export function iniciarGeneradorCodigoBarras({ store }) {
  const inputConsulta = document.getElementById("input-consulta-codigo");
  if (!inputConsulta) return;

  inputConsulta.addEventListener("dblclick", () => {
    const productos = store?.obtenerProductos() ?? [];
    if (productos.length === 0) return;

    const productoAzar =
      productos[Math.floor(Math.random() * productos.length)];

    inputConsulta.value =
      productoAzar.codigoBarras ?? generarCodigoBarrasFalso(productoAzar.id);

    inputConsulta.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      }),
    );
  });
}