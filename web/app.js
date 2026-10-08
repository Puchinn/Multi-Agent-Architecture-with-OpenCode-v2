/* ═══════════════════════════════════════════════════════════
   🎪 Circo Gran Fantasía — "Circo en Vivo" (Fase 1 + Fase 2)
   ───────────────────────────────────────────────────────────
   · Fase 1 (conservada): datos SIMULADOS cuyo formato imita los
     payloads reales; un simulador con setInterval hace "respirar"
     la carpa. Sigue funcionando 100% offline con doble clic (file://).
   · Fase 2 (nuevo): si la página se sirve por http(s), se suscribe
     al relé web/relay.js por SSE (/api/live) y pinta los estados
     REALES del elenco. Indicador de cabecera:
       🟢 EN VIVO (verde) · 🟡 SIMULADO (ámbar) · 🔴 SIN SEÑAL (rojo)
   · DOM puro — sin frameworks, sin CDNs, sin otros orígenes.
   ═══════════════════════════════════════════════════════════ */
"use strict";

/* ──────────────────────────────────────────────
   1) DATOS SIMULADOS (contrato de la Fase 2 real)
   ────────────────────────────────────────────── */
const DATOS_SIMULADOS = {
  meta: {
    fuente: "simulacion",                       // "simulacion" | "conectado"
    carpa: "Río Segundo, Córdoba",
  },

  agentes: [
    { id: "director",    nombre: "Director",     emoji: "🎼", estado: "trabajando", ultimaAccion: "coordinando al elenco" },
    { id: "presentador", nombre: "Presentador",  emoji: "🎤", estado: "trabajando", ultimaAccion: "ensayando la salutación" },
    { id: "payaso",      nombre: "Polverita",    emoji: "🤡", estado: "trabajando", ultimaAccion: "escribiendo chiste…" },
    { id: "utilero",     nombre: "Don Barnaby",  emoji: "🔧", estado: "idle",       ultimaAccion: "contando arneses en bodega" },
    { id: "aprendiz",    nombre: "El Aprendiz",  emoji: "🎓", estado: "trabajando", ultimaAccion: "execute_sql…" },
  ],

  inventario: [
    { codigo: "UTL-001", nombre: "Trapecio principal",        cantidad: 1,  peso_kg: 45,  estado: "operativo" },
    { codigo: "UTL-004", nombre: "Pelota de equilibrio",      cantidad: 12, peso_kg: 0.4, estado: "operativo" },
    { codigo: "UTL-009", nombre: "Arnés acrobático homologado", cantidad: 5, peso_kg: 2.5, estado: "operativo" },
    { codigo: "UTL-010", nombre: "Taburete de equilibrista",  cantidad: 0,  peso_kg: 3.5, estado: "dado_de_baja" },
    { codigo: "UTL-021", nombre: "Bomba de humo",             cantidad: 2,  peso_kg: 8,   estado: "mantenimiento" },
  ],

  bitacora: [
    {
      fecha: "2026-10-08",
      titulo: "Función #002 — Halloween",
      texto: "Presentador: salutación solemne. Polvorita: rutina vampiro-dentista, fantasma 'no me espíres' y lluvia de caramelos ¡dulce o truco!. Despido al público de Río Segundo.",
    },
    {
      fecha: "2026-10-08",
      titulo: "Faena #1 — Reparación del arnés UTL-009",
      texto: "El arnés pasa a operativo (5 piezas · 12,5 kg) tras doble pespunte y prueba de carga firmada por Don Barnaby. El trapecio puede volar de nuevo.",
    },
  ],

  boletaria: {
    comandos: ["/funcion", "/ensayo"],
    skills: ["cartelera-circense", "inventario-tecnico"],
  },
};

/* Acciones que el simulador reparte entre personajes
   (imitan los tool states Running/Streaming/Error del API). */
const POOL_ACCIONES = {
  director:    ["coordinando al elenco", "leyendo MEMORY.md", "repitiendo la orden al utilero", "apuntando la bitácora"],
  presentador: ["ensayando la salutación", "subiendo el volumen de la música", "recitando el cartel"],
  payaso:      ["escribiendo chiste…", "acababa de tropezar — ¡¡Honk honk!!", "contando caramelos en escena"],
  utilero:     ["execute_sql…", "pesando utilería", "repasando la bodega", "verificando el arnés UTL-009"],
  aprendiz:    ["execute_sql…", "redactando borrador…", "intentando paso 1 de 2", "releyendo el plan"],
};

/* (Fase 2: el relé también emite "desconectado" si la API de OpenCode cae) */
const TEXTOS_ESTADO = {
  idle: "reposo",
  trabajando: "trabajando",
  error: "error",
  desconectado: "desconectado",
};

/* ──────────────────────────────────────────────
   2) UTILIDADES
   ────────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);

const aleatorio = (lista) => lista[Math.floor(Math.random() * lista.length)];

const horaLocal = () =>
  new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const pesoES = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 2 });

/* Recorta texto externo antes de mostrarlo en bambalinas (requisito Fase 2: ~120 chars). */
const truncar = (s, n) => (String(s || "").length > n ? String(s).slice(0, n - 1) + "…" : String(s || ""));

/* ──────────────────────────────────────────────
   3) RENDER DE LA PISTA CENTRAL (los 5)
   ────────────────────────────────────────────── */
function pintarAgentes() {
  const contenedor = $("#fila-agentes");
  contenedor.innerHTML = "";

  DATOS_SIMULADOS.agentes.forEach((agente) => {
    const carta = document.createElement("article");
    carta.className = `agente estado-${agente.estado}`;
    carta.id = `agente-${agente.id}`;
    carta.setAttribute("aria-label", `${agente.nombre}: ${TEXTOS_ESTADO[agente.estado]}`);
    carta.innerHTML = `
      <div class="avatar" aria-hidden="true">${agente.emoji}</div>
      <h3>${agente.nombre}</h3>
      <p class="estado-texto"><span class="texto-estado">${TEXTOS_ESTADO[agente.estado]}</span></p>
      <div class="burbuja">${agente.ultimaAccion}</div>
    `;
    contenedor.appendChild(carta);
  });
}

function actualizarAgente(id, estado, accion) {
  const agente = DATOS_SIMULADOS.agentes.find((a) => a.id === id);
  if (!agente) return;
  agente.estado = estado;
  agente.ultimaAccion = accion;

  const carta = document.getElementById(`agente-${id}`);
  if (!carta) return;
  carta.className = `agente estado-${estado}`;
  carta.setAttribute("aria-label", `${agente.nombre}: ${TEXTOS_ESTADO[estado]}`);
  carta.querySelector(".texto-estado").textContent = TEXTOS_ESTADO[estado];
  carta.querySelector(".burbuja").textContent = accion;
}

/* ──────────────────────────────────────────────
   4) BODEGA (tabla + total)
   ────────────────────────────────────────────── */
/* Normaliza para la comparación: minúsculas y sin acentos/diacríticas.
   Así «arnes» encuentra «Arnés acrobático homologado» (y «UTL-009» a UTL-009). */
const normalizar = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function pintarBodega() {
  const cuerpo = $("#filas-inventario");
  cuerpo.innerHTML = "";

  // Filtro activo: substring sobre código y nombre, sin mayúsculas ni acentos.
  const inputBodega = document.getElementById("buscar-bodega");
  const textoCrudo = inputBodega ? inputBodega.value : "";
  const criterio = normalizar(textoCrudo);

  const visibles = DATOS_SIMULADOS.inventario.filter((item) => {
    if (!criterio) return true;
    return (
      normalizar(item.codigo).includes(criterio) ||
      normalizar(item.nombre).includes(criterio)
    );
  });

  // Orden (solo si hay campo activo): SIEMPRE después del .filter().
  // cantidad / peso_kg → numérico · codigo / nombre / estado → localeCompare("es").
  if (ordenCampo) {
    visibles.sort((a, b) => ordenDir * comparadorBodega(a[ordenCampo], b[ordenCampo]));
  }

  let cantTotal = 0;
  let pesoTotal = 0;

  if (visibles.length === 0) {
    // Sin coincidencias: aviso de fila única + totales a 0.
    const filaVacia = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.className = "celda-sin-resultados";
    celda.textContent = `Sin resultados para «${textoCrudo}»`;
    filaVacia.appendChild(celda);
    cuerpo.appendChild(filaVacia);
  } else {
    visibles.forEach((item) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.codigo}</td>
      <td>${item.nombre}</td>
      <td class="num">${item.cantidad}</td>
      <td class="num">${pesoES(item.peso_kg)}</td>
      <td><span class="pill-estado ${item.estado}">${item.estado.replace(/_/g, " ")}</span></td>
    `;
    cuerpo.appendChild(fila);
    cantTotal += item.cantidad;
    pesoTotal += item.cantidad * item.peso_kg;
    });
  }

  const pie = $("#fila-total");
  pie.innerHTML = `
    <tr>
      <td colspan="2">Total (esta lista)</td>
      <td class="num">${cantTotal} uds</td>
      <td class="num">${pesoES(pesoTotal)} kg</td>
      <td>—</td>
    </tr>
  `;

  // Contador visible: «N de 5 ítems» (N = filas visibles).
  const contador = $("#contador-bodega");
  if (contador) {
    contador.textContent =
      visibles.length + " de " + DATOS_SIMULADOS.inventario.length + " ítems";
  }

  // Estado visible/accesible de las cabeceras (aria-sort + ▲/▼ del botón activo).
  actualizarIndicadoresOrden();
}

/* Filtro de bodega: cada tecla repinta (con 5 filas no hace falta debounce). */
function conectarFiltroBodega() {
  const campo = document.getElementById("buscar-bodega");
  if (campo) campo.addEventListener("input", pintarBodega);
}

/* ── Orden de bodega (cabeceras ordenables) ─────────────────
   Estado de módulo: campo activo + dirección (1 = asc, -1 = desc).
   El orden se aplica SIEMPRE después del filtro, sobre el conjunto
   ya filtrado: ordenar no cambia qué filas son visibles. */
let ordenCampo = null;  // null | "codigo" | "nombre" | "cantidad" | "peso_kg" | "estado"
let ordenDir = 1;       // 1 = ascendente · -1 = descendente

/* Comparadores por tipo: numérico para cantidad/peso_kg,
   localeCompare("es") para los de texto. Empates → 0 (estable). */
function comparadorBodega(a, b) {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es");
}

/* Actualiza el estado accesible (aria-sort en cada <th>) y el
   indicador ▲/▼ del botón activo. Todo por textContent: sin innerHTML
   con dato externo. Lo llama pintarBodega() al final de cada pintado. */
function actualizarIndicadoresOrden() {
  const botones = document.querySelectorAll(".tabla-inventario thead .btn-orden");
  botones.forEach((btn) => {
    const activo = btn.dataset.campo === ordenCampo;
    btn.textContent = btn.dataset.campo === "cantidad"
      ? "Cant."
      : btn.dataset.campo === "peso_kg"
        ? "Peso (kg)"
        : btn.dataset.campo === "codigo"
          ? "Código"
          : btn.dataset.campo === "nombre"
            ? "Nombre"
            : "Estado";
    btn.textContent += activo ? (ordenDir === 1 ? " ▲" : " ▼") : "";
    const th = btn.closest("th");
    if (th) th.setAttribute("aria-sort", activo ? (ordenDir === 1 ? "ascending" : "descending") : "none");
  });
}

/* Delegado en el <thead>: un solo listener para los 5 botones.
   Misma columna → invierte la dirección; otra columna → arranca en ascendente. */
function conectarOrdenBodega() {
  const thead = document.querySelector(".tabla-inventario thead");
  if (!thead) return;
  thead.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-orden");
    if (!btn) return;
    const campo = btn.dataset.campo;
    if (!campo) return;
    if (ordenCampo === campo) {
      ordenDir = -ordenDir; // repite la misma → invierte asc/desc
    } else {
      ordenCampo = campo;
      ordenDir = 1;         // otra columna → siempre arranca ascendente
    }
    pintarBodega();
  });
}

/* ──────────────────────────────────────────────
   5) BOLETERÍA + BITÁCORA
   ────────────────────────────────────────────── */
/* Descripciones cortas y fieles del circo (una línea, texto propio
   de la casa — nunca dato externo), para el panel de detalle. */
const DESCRIPCIONES_BOLETERIA = {
  "/funcion": "Monta la función: Presentador, Payaso y números a cargo del Director.",
  "/ensayo": "Pase general del elenco con revisión técnica y visto del Utilero.",
  "cartelera-circense": "Skill: plantillas de la cartelera oficial (actos, precios y horarios).",
  "inventario-tecnico": "Skill: reglas de la utilería en Supabase (peso, stock y logística).",
};

function pintarBoletaria() {
  const cmds = $("#chips-comandos");
  cmds.innerHTML = "";
  DATOS_SIMULADOS.boletaria.comandos.forEach((c) => {
    cmds.appendChild(hacerChip(c, "chip"));
  });

  const skls = $("#chips-skills");
  skls.innerHTML = "";
  DATOS_SIMULADOS.boletaria.skills.forEach((s) => {
    skls.appendChild(hacerChip(s, "chip chip-skill"));
  });
}

/* Cada chip es un <button> real (focusable y operable con teclado). */
function hacerChip(texto, clases) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = clases;
  chip.textContent = texto;
  chip.setAttribute("aria-pressed", "false");
  return chip;
}

/* Detalle del chip tocado: nombre en negrita + descripción, todo por
   textContent (nada de innerHTML con dato). Re-pulsar desactiva. */
function alternarChip(chip) {
  const panel = document.getElementById("detalle-boleteria");
  if (!panel) return;
  const activo = chip.getAttribute("aria-pressed") === "true";

  if (activo) {
    chip.setAttribute("aria-pressed", "false");
    chip.classList.remove("chip-activo");
    panel.textContent = "";
    panel.classList.remove("con-detalle");
    return;
  }

  document.querySelectorAll(".chip[aria-pressed='true']").forEach((otro) => {
    otro.setAttribute("aria-pressed", "false");
    otro.classList.remove("chip-activo");
  });

  chip.setAttribute("aria-pressed", "true");
  chip.classList.add("chip-activo");

  const nombre = document.createElement("strong");
  nombre.textContent = chip.textContent;
  panel.textContent = "";
  panel.appendChild(nombre);
  panel.appendChild(document.createTextNode(" — "));
  panel.appendChild(
    document.createTextNode(
      DESCRIPCIONES_BOLETERIA[chip.textContent] || "Acto de la carpa: detalles pendientes de apuntar."
    )
  );
  panel.classList.add("con-detalle");
}

/* Delegado en la sección .boletaria: un solo listener para las 4 chips. */
function conectarBoletaria() {
  const seccion = document.querySelector(".boletaria");
  if (!seccion) return;
  seccion.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) alternarChip(chip);
  });
}

function pintarBitacora() {
  const lista = $("#lista-bitacora");
  lista.innerHTML = "";
  DATOS_SIMULADOS.bitacora.forEach((entrada) => {
    const li = document.createElement("li");

    // <details>/<summary>: abrir y cerrar es nativo; teclado y lector de
    // pantalla lo manejan sin JavaScript propio.
    const det = document.createElement("details");
    const sum = document.createElement("summary");

    const fecha = document.createElement("time");
    fecha.setAttribute("datetime", entrada.fecha);
    fecha.className = "fecha";
    fecha.textContent = entrada.fecha;

    const titulo = document.createElement("span");
    titulo.className = "titulo-entrada";
    titulo.textContent = entrada.titulo;

    sum.appendChild(fecha);
    sum.appendChild(document.createTextNode(" — "));
    sum.appendChild(titulo);
    det.appendChild(sum);

    const cuerpo = document.createElement("div");
    cuerpo.className = "cuerpo-entrada";
    cuerpo.textContent = entrada.texto;
    det.appendChild(cuerpo);

    li.appendChild(det);
    lista.appendChild(li);
  });
}

/* ──────────────────────────────────────────────
   6) FEED DE BAMBALINAS
   ────────────────────────────────────────────── */
const FEED_MAXIMO = 30;

/* ══ Controles de bambalinas: pausa con colchón, limpiar y filtro ══
   La compuerta `publicar(fn)` decide si pinta ahora o guarda `fn` en la
   cola. La pausa NO detiene simulador ni relé: sólo el pintado del feed. */
let EN_PAUSA = false;
const colaPausa = [];

function publicar(fn) {
  if (EN_PAUSA) colaPausa.push(fn);
  else fn();
}

/* Contador de eventos OpenCode (variable de módulo, arranca en 0).
   Cuenta EVENTOS recibidos por el relé, no líneas del feed: cuando se
   agrupan con «· ×N» también cuenta como 1 evento. Vive dentro de la
   compuerta `publicar()`: con la pausa el feed no se pinta y el contador
   queda congelado; al reanudar, la cola se vuelca y se pone al día solo. */
let TOTAL_EVENTOS = 0;
function actualizarContadorEventos() {
  TOTAL_EVENTOS += 1;
  const c = document.getElementById("contador-eventos");
  if (c) c.textContent = `📡 eventos: ${TOTAL_EVENTOS}`;
}

/* Pausar/Reanudar: al reanudar se vuelca la cola en el orden FIFO guardado;
   como cada función hace prepend, la última (la más reciente) queda arriba. */
function alternarPausa() {
  EN_PAUSA = !EN_PAUSA;
  $("#btn-pausar").textContent = EN_PAUSA ? "Reanudar" : "Pausar";
  if (!EN_PAUSA) {
    const pendientes = colaPausa.splice(0, colaPausa.length);
    for (const fn of pendientes) fn();
  }
}

/* Limpiar: vacía el feed visible y, si hay mensajes guardados en pausa,
   la cola también (lo que ya llegó no se conserva; lo nuevo seguirá encolandose). */
function limpiarFeed() {
  const feed = $("#feed");
  feed.innerHTML = "";
  colaPausa.length = 0;
}

function agregarFeed(texto, esError) {
  publicar(() => {
  const feed = $("#feed");
  feed.querySelectorAll(".feed-vacio").forEach((li) => li.remove());

  const li = document.createElement("li");
  if (esError) li.className = "feed-error";
  li.innerHTML = `<time>[${horaLocal()}]</time> ${texto}`;
  feed.prepend(li);

  while (feed.children.length > FEED_MAXIMO) {
    feed.removeChild(feed.lastChild);
  }
  });
}

/* Línea de feed en TEXTO PURO para datos del relé (aviso/evento).
   No usa innerHTML: lo que llega del relé es dato ajeno, no markup. */
function agregarFeedSeguro(texto, esError) {
  publicar(() => {
  const feed = $("#feed");
  if (!feed) return;
  feed.querySelectorAll(".feed-vacio").forEach((li) => li.remove());

  const li = document.createElement("li");
  if (esError) li.className = "feed-error";

  const time = document.createElement("time");
  time.textContent = `[${horaLocal()}]`;
  li.appendChild(time);
  li.appendChild(document.createTextNode(" " + texto));
  feed.prepend(li);

  while (feed.children.length > FEED_MAXIMO) {
    feed.removeChild(feed.lastChild);
  }
  });
}

/* «Traductor de bambalinas»: convierte un payload crudo de OpenCode
   en una frase humana corta. Nunca deja JSON ni rutas a pantalla. */
function traducirEvento(payload) {
  let grupo = "interno";
  try {
    const t = String((JSON.parse(payload) || {}).type || "");
    if (t.indexOf("session.reasoning") === 0) grupo = "reasoning";
    else if (t.indexOf("session.text") === 0) grupo = "text";
    else if (t.indexOf("session.tool") === 0) grupo = "tool";
    else if (t.indexOf("session.step") === 0) grupo = "step";
    else if (t.indexOf("session.usage") === 0) grupo = "usage";
  } catch (_) {
    grupo = "interno"; // payload no JSON o sin type → sin drama.
  }
  return {
    grupo: grupo,
    frase:
      grupo === "reasoning" ? "pensando…" :
      grupo === "text" ? "escribiendo…" :
      grupo === "tool" ? "usando herramienta…" :
      grupo === "step" ? "avanzando de paso…" :
      grupo === "usage" ? "registrando consumo…" :
      "evento interno…",
  };
}

/* Línea de evento OpenCode en texto puro, con contador de ráfagas:
   si la última línea del feed ya es del MISMO grupo, no se agrega una
   nueva: se reescribe su texto con «· ×N». Cero innerHTML con dato del relé. */
function agregarEventoFeed(grupo, frase) {
  publicar(() => {
  const feed = $("#feed");
  if (!feed) return;
  actualizarContadorEventos(); // 1 evento recibido (cuenta también si lo agrupo con ×N)
  feed.querySelectorAll(".feed-vacio").forEach((li) => li.remove());

  const primera = feed.firstElementChild;
  const hora = `[${horaLocal()}]`;

  if (primera && primera.dataset.grupo === grupo) {
    const n = (parseInt(primera.dataset.contador, 10) || 1) + 1;
    primera.dataset.contador = String(n);
    // ¡No usar textContent acá! Se llevaría puesto el <time> hijo.
    // El <time> se Actualiza a la hora y el <span> lleva frase + contador.
    const time = primera.querySelector("time");
    let span = primera.querySelector("span");
    if (time) time.textContent = hora;
    if (!span) {
      span = document.createElement("span");
      primera.insertBefore(span, primera.firstChild);
    }
    span.textContent = ` 📡 OpenCode → ${frase} · ×${n}`;
    feed.prepend(primera); // vuelve a lo alto: es lo más reciente
    return;
  }

  const li = document.createElement("li");
  li.dataset.grupo = grupo;
  li.dataset.contador = "1";

  const time = document.createElement("time");
  time.textContent = hora;
  li.appendChild(time);
  const span = document.createElement("span");
  span.textContent = " 📡 OpenCode → " + frase;
  li.appendChild(span);
  feed.prepend(li);

  while (feed.children.length > FEED_MAXIMO) {
    feed.removeChild(feed.lastChild);
  }
  });
}

/* ──────────────────────────────────────────────
   7) SIMULADOR — para que la carpa respire
   ────────────────────────────────────────────── */
function estadoAleatorio() {
  const r = Math.random();
  if (r < 0.55) return "trabajando";
  if (r < 0.85) return "idle";
  return "error";
}

function tick() {
  // En modo EN VIVO el simulador descansa: manda el relé.
  if (MODO_ACTUAL === "vivo") return;

  const agente = aleatorio(DATOS_SIMULADOS.agentes);
  const estado = estadoAleatorio();
  const accion =
    estado === "error"
      ? "algo se le rompió en la carpa…"
      : aleatorio(POOL_ACCIONES[agente.id] || ["pensando en la función"]);

  actualizarAgente(agente.id, estado, accion);
  agregarFeed(
    `${agente.emoji} <strong>${agente.nombre}</strong> → <em>${TEXTOS_ESTADO[estado]}</em> · ${accion}`,
    estado === "error"
  );
}

/* ──────────────────────────────────────────────
   8) ARRANQUE
   ────────────────────────────────────────────── */
function iniciar() {
  pintarAgentes();
  pintadoBoletariaSeguro();
  conectarFiltroBodega();
  conectarOrdenBodega(); // listener único delegado en el thead (una sola vez)
  conectarBoletaria();   // listener único delegado en la sección .boletaria
  pintarBodega();
  pintarBitacora();

  // Saludo inicial del Director en bambalinas.
  agregarFeed("🎼 <strong>Director</strong> → la carpa abre con datos simulados · Fase 1");

  // Controles de bambalinas: pausa, limpiar y filtro «sólo circo».
  $("#btn-pausar").addEventListener("click", alternarPausa);
  $("#btn-limpiar").addEventListener("click", limpiarFeed);
  $("#chk-solo-circo").addEventListener("change", (e) => {
    $("#feed").classList.toggle("solo-circo", e.target.checked);
  });

  // La carpa respira cada 4 segundos (dentro del rango pedido de 3–5 s).
  setInterval(tick, 4000);

  // Insignia honesta de la API: repinta cada segundo (frescura de la señal)
  // aunque el relé no esté emitiendo mensajes.
  pintarSaludAPI();
  setInterval(pintarSaludAPI, 1000);

  // Fase 2: si nos sirven por http, intentamos engancharnos al relé.
  conectarRelé();
}

/* ──────────────────────────────────────────────
   9) CONEXIÓN EN VIVO (relé /api/live por SSE)
   ────────────────────────────────────────────── */
let MODO_ACTUAL = "simulado"; // "simulado" | "vivo" | "sin-senal"
let sseAbierto = false;

/* Insignia honesta de la API de OpenCode: el relé manda `api` en cada
   mensaje "estado" ("ok" | "caída" | "iniciando"), y guardamos también
   CUÁNDO llegó la última señal para poder decirlo aunque el relé se calle. */
let apiActual = null;      // "ok" | "caída" | "iniciando" | null (aún no llegó)
let ultimaSenalTs = null;  // Date.now() del último mensaje "estado"

function pintarSaludAPI() {
  const el = $("#salud-api");
  if (!el) return;

  let icono, texto, cls;
  if (apiActual === "ok") { icono = "🧠"; texto = "API: ok"; cls = "badge-api-ok"; }
  else if (apiActual === "caída") { icono = "⚠️"; texto = "API: caída"; cls = "badge-api-caida"; }
  else { icono = "⏳"; texto = "API: iniciando"; cls = "badge-api-espera"; } // incluye "iniciando" o aún nada

  // Frescura: depende de la ÚLTIMA señal, no solo de lo último visto.
  let fresco;
  if (ultimaSenalTs === null) {
    fresco = "· sin señal";
  } else {
    const seg = Math.floor((Date.now() - ultimaSenalTs) / 1000);
    fresco = seg > 90 ? `· hace ${Math.floor(seg / 60)} min` : `· hace ${seg} s`;
  }

  el.className = "badge " + cls;
  el.textContent = `${icono} ${texto} ${fresco}`;
}

function ponerIndicador(modo, texto) {
  MODO_ACTUAL = modo;
  const el = $("#indicador-enlace");
  if (!el) return;
  el.className =
    "badge " + (modo === "vivo" ? "conectado" : modo === "sin-senal" ? "badge-sin-senal" : "badge-simulado");
  el.textContent =
    texto || (modo === "vivo" ? "🟢 EN VIVO" : modo === "sin-senal" ? "🔴 SIN SEÑAL" : "🟡 SIMULADO");
}

function aplicarEstadoRelé(est) {
  // Insignia honesta: registro del estado de la API y del momento de llegada.
  apiActual = est.api;
  ultimaSenalTs = Date.now();

  if (Array.isArray(est.agentes)) {
    est.agentes.forEach((a) => actualizarAgente(a.id, a.estado, a.ultimaAccion));
  }
  const cont = $("#contador-sesiones");
  if (cont && typeof est.sesiones === "number") {
    cont.textContent = "🎟️ sesiones: " + est.sesiones;
  }
}

function manejarMensajeRelé(obj) {
  if (!obj || !obj.type) return;
  if (obj.type === "estado") {
    aplicarEstadoRelé(obj);
  } else if (obj.type === "aviso") {
    agregarFeedSeguro("⚠️ relé: " + truncar(obj.mensaje, 120), true);
  } else if (obj.type === "evento") {
    const evento = traducirEvento(obj.payload);
    agregarEventoFeed(evento.grupo, evento.frase);
  }
}

function conectarRelé() {
  // Sólo tiene sentido con http(s). Con doble clic (file://) seguimos simulando.
  if (!/^https?:$/.test(location.protocol) || typeof EventSource === "undefined") {
    ponerIndicador("simulado");
    return;
  }

  let sse;
  try {
    sse = new EventSource("/api/live");
  } catch (_) {
    ponerIndicador("simulado");
    return;
  }

  sse.onopen = () => {
    sseAbierto = true;
    ponerIndicador("vivo");
    agregarFeedSeguro("🟢 ¡CONECTADO AL RELÉ! Los estados son reales.", false);
  };

  sse.onmessage = (ev) => {
    try {
      manejarMensajeRelé(JSON.parse(ev.data));
    } catch (_) {}
  };

  sse.onerror = () => {
    if (sseAbierto) {
      // El relé funcionó y se cayó: señal roja + volvemos a respirar con el simulador.
      ponerIndicador("sin-senal");
      agregarFeedSeguro("🔴 Se perdió la señal del relé — vuelve el simulador de respaldo.", true);
      sseAbierto = false;
    } else {
      // Nunca conectó: nos quedamos en simulación sin alarmar.
      ponerIndicador("simulado");
    }
  };
}

/* Guardacostas: si el HTML cambia de contenedores, no rompa el resto. */
function pintadoBoletariaSeguro() {
  if ($("#chips-comandos") && $("#chips-skills")) pintarBoletaria();
}

/* <script defer> ⇒ el DOM ya está parseado cuando esto corre. */
iniciar();
