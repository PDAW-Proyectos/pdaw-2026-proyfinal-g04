export function renderizarInicioRepositor({
  productos = [],
  categorias = [],
  nombreUsuario = "Repositor",
  umbralesStock = { critico: 5, medio: 10 },
  onReponerClick,
  onIrAInventario,
}) {
  const saludoEl = document.getElementById("repo-saludo");
  if (saludoEl) saludoEl.textContent = `Hola, ${nombreUsuario}`;

  const btnVerTodo = document.getElementById("btn-repo-ver-todo");
  if (btnVerTodo) btnVerTodo.onclick = () => onIrAInventario?.();

  const mapaCategorias = new Map(categorias.map((c) => [c.id, c.nombre]));
  const criticos = [];
  const bajos = [];

  productos.forEach((p) => {
    const esPorPeso = p.peso !== undefined;
    const cantidad = Number(p.stock ?? p.peso ?? p.unidad ?? 0);
    const unidad = esPorPeso ? (p.unidadMedida || "kg") : "u.";
    const etiquetaStock = `${cantidad} ${unidad}`;
    const nombreCategoria = p.categoria
      || mapaCategorias.get(p.idCategoria)
      || `Categoría #${p.idCategoria}`;

    const item = { ...p, cantidad, etiquetaStock, nombreCategoria };
    const umbralCritico = umbralesStock.critico;
    const umbralBajo = umbralesStock.medio;

    if (cantidad <= umbralCritico) criticos.push(item);
    else if (cantidad <= umbralBajo) bajos.push(item);
  });

  criticos.sort((a, b) => a.cantidad - b.cantidad);
  bajos.sort((a, b) => a.cantidad - b.cantidad);
  const todosUrgentes = [...criticos, ...bajos].sort(
    (a, b) => a.cantidad - b.cantidad,
  );

  // 1. Actualizar KPIs
  const totalEl = document.getElementById("repo-kpi-total");
  const alertasEl = document.getElementById("repo-kpi-alertas");
  const categoriaEl = document.getElementById("repo-kpi-categoria");
  if (totalEl) totalEl.textContent = `${productos.length} productos`;
  if (alertasEl) alertasEl.textContent = `${todosUrgentes.length} ítems`;

  let catAfectada = "Todo en orden";
  if (todosUrgentes.length > 0) {
    const conteo = {};
    todosUrgentes.forEach((i) => {
      conteo[i.nombreCategoria] = (conteo[i.nombreCategoria] || 0) + 1;
    });
    const [topCat, cant] = Object.entries(conteo).sort(
      (a, b) => b[1] - a[1],
    )[0];
    catAfectada = `${topCat} (${cant})`;
  }
  if (categoriaEl) categoriaEl.textContent = catAfectada;

  function conectarSwap(prefijo, tituloBadge, items) {
    const card = document.getElementById(`swap-card-${prefijo}`);
    const badge = document.getElementById(`badge-${prefijo}`);
    const dotsBox = document.getElementById(`dots-${prefijo}`);
    const catEl = document.getElementById(`cat-${prefijo}`);
    const nombreEl = document.getElementById(`nombre-${prefijo}`);
    const stockEl = document.getElementById(`stock-${prefijo}`);
    const btn = document.getElementById(`btn-reponer-${prefijo}`);

    if (!card || !badge || !dotsBox || !catEl || !nombreEl || !stockEl || !btn) return;

    if (card.timer) clearInterval(card.timer);
    card.timer = null;
    card.onmouseenter = null;
    card.onmouseleave = null;
    btn.onclick = null;
    badge.textContent = `${tituloBadge} (${items.length})`;
    dotsBox.innerHTML = "";

    if (items.length === 0) {
      catEl.textContent = "";
      nombreEl.textContent = prefijo === "criticos"
        ? "Sin alertas críticas"
        : "Sin productos con stock bajo";
      stockEl.textContent = prefijo === "criticos"
        ? "No hay productos por debajo del umbral crítico."
        : "No hay productos en nivel de advertencia.";
      btn.classList.add("oculto");
      return;
    }

    btn.classList.remove("oculto");
    let idxActual = 0;
    let pausado = false;

    card.onmouseenter = () => {
      pausado = true;
      if (card.timer) clearInterval(card.timer);
      card.timer = null;
    };
    card.onmouseleave = () => {
      pausado = false;
      arrancar();
    };

    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "swap-dot";
      dot.ariaLabel = `Ver ítem ${i + 1}`;
      dot.addEventListener("click", () => {
        idxActual = i;
        pintar();
        if (!pausado) arrancar();
      });
      dotsBox.appendChild(dot);
    });

    function pintar() {
      const actual = items[idxActual];
      const info = card.querySelector(".swap-info");
      info?.classList.remove("animando");
      if (info) {
        void info.offsetWidth;
        info.classList.add("animando");
      }
      catEl.textContent = actual.nombreCategoria;
      nombreEl.textContent = actual.nombre;
      stockEl.textContent = `Stock actual: ${actual.etiquetaStock}`;
      dotsBox.querySelectorAll(".swap-dot").forEach((d, i) => {
        d.classList.toggle("activo", i === idxActual);
      });
    }

    btn.onclick = () => onReponerClick?.(items[idxActual]);

    const arrancar = () => {
      if (card.timer) clearInterval(card.timer);
      if (items.length <= 1) return;
      card.timer = setInterval(() => {
        idxActual = (idxActual + 1) % items.length;
        pintar();
      }, 4000);
    };

    pintar();
    arrancar();
  }

  conectarSwap("criticos", "Stock Crítico", criticos);
  conectarSwap("bajos", "Stock Bajo", bajos);

  const lista = document.getElementById("repo-lista-urgentes");
  if (!lista) return;
  lista.innerHTML = "";

  if (todosUrgentes.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "perfil-ayuda-texto";
    vacio.textContent = "No hay reposiciones pendientes por ahora.";
    lista.appendChild(vacio);
    return;
  }

  todosUrgentes.slice(0, 5).forEach((prod) => {
    const fila = document.createElement("div");
    fila.className = "repo-urgente-fila";

    const info = document.createElement("div");
    const nombre = document.createElement("strong");
    nombre.className = "urgente-nombre";
    nombre.textContent = prod.nombre;

    const cat = document.createElement("span");
    cat.className = "urgente-cat";
    cat.textContent = ` · ${prod.nombreCategoria}`;
    info.append(nombre, cat);

    const acciones = document.createElement("div");
    acciones.className = "urgente-derecha";

    const pill = document.createElement("span");
    pill.className = "urgente-stock-pill";
    pill.textContent = prod.etiquetaStock;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-outline-neutro btn-sm";
    btn.textContent = "+ Reponer";
    btn.addEventListener("click", () => onReponerClick?.(prod));

    acciones.append(pill, btn);
    fila.append(info, acciones);
    lista.appendChild(fila);
  });
}