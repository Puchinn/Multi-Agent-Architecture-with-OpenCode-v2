#!/usr/bin/env node
/**
 * 🎪 Circo en Vivo — Relé (Fase 2)
 * Node puro, SIN dependencias.
 *
 *   node web/relay.js           # arrancar (primer plano o con background)
 *   node web/relay.js --status  # comprobar estado
 *   node web/relay.js --stop    # detener por PID
 *
 * Hace 3 cosas:
 *   1. Sirve la página web/ en http://127.0.0.1:7777 (mismo origen → sin CORS)
 *   2. Sondea la API de OpenCode (Basic auth) y deriva los estados del elenco
 *   3. Emite esos estados a la página por SSE en /api/live
 *
 * Credenciales: lee ~/.local/state/opencode/service.json (url + password)
 * o usa OPENCODE_URL / OPENCODE_PASSWORD como alternativa.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT || 7777);
const WEB_DIR = __dirname;
const PID_FILE = path.join(WEB_DIR, ".relay.pid");
const POLL_MS = 2500;
const EVENT_TTL_MS = 1000 * 60 * 60;

/* ---------- Configuración de OpenCode ---------- */
function loadOpenCode() {
  if (process.env.OPENCODE_URL && process.env.OPENCODE_PASSWORD) {
    return { url: process.env.OPENCODE_URL, password: process.env.OPENCODE_PASSWORD };
  }
  const candidates = [
    path.join(os.homedir(), ".local", "state", "opencode", "service.json"),
    path.join(os.homedir(), ".config", "opencode", "service.json"),
  ];
  for (const p of candidates) {
    try {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      if (j.url && j.password) return { url: j.url, password: j.password };
    } catch (_) {}
  }
  console.error("❌ No se encontró la configuración del servicio de OpenCode.");
  console.error("   Define OPENCODE_URL y OPENCODE_PASSWORD, o revisa ~/.local/state/opencode/service.json");
  process.exit(1);
}

const oc = loadOpenCode();
const AUTH = "Basic " + Buffer.from("opencode:" + oc.password).toString("base64");

/* ---------- Elenco: mapa de agentes → personajes ---------- */
const ELENCO = {
  director:    { nombre: "Director",    emoji: "🎼" },
  presentador: { nombre: "Presentador", emoji: "🎤" },
  payaso:      { nombre: "Polverita",   emoji: "🤡" },
  utilero:     { nombre: "Don Barnaby", emoji: "🔧" },
  aprendiz:    { nombre: "El Aprendiz", emoji: "🎓" },
};

/* ---------- Cliente de la API de OpenCode ---------- */
async function ocGet(pathname, timeoutMs = 4000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(oc.url + pathname, {
      headers: { Authorization: AUTH },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

/* ---------- Derivación de estados del elenco ---------- */
function clasificarMensaje(msg) {
  if (!msg || !Array.isArray(msg.content)) return null;
  for (let i = msg.content.length - 1; i >= 0; i--) {
    const c = msg.content[i];
    if (c.type === "tool") {
      const st = c.state && c.state.status;
      if (st === "running" || st === "streaming") return { accion: (c.tool || "herramienta") + "…" , estado: "trabajando" };
      if (st === "error") return { accion: "error en " + (c.tool || "herramienta"), estado: "error" };
      return { accion: (c.tool || "herramienta") + " ✓", estado: "trabajando" };
    }
    if (c.type === "reasoning") return { accion: "pensando…", estado: "trabajando" };
    if (c.type === "text") return { accion: "escribiendo…", estado: "trabajando" };
  }
  return { accion: "procesando…", estado: "trabajando" };
}

async function calcularEstados() {
  const agentes = Object.entries(ELENCO).map(([id, m]) => ({
    id, nombre: m.nombre, emoji: m.emoji, estado: "idle", ultimaAccion: "en reposo",
  }));
  const porId = Object.fromEntries(agentes.map((a) => [a.id, a]));

  let activas = {};
  try {
    const r = await ocGet("/api/session/active");
    activas = (r && r.data) || {};
  } catch (_) {
    for (const a of agentes) { a.estado = "desconectado"; a.ultimaAccion = "sin señal del circo"; }
    return { agentes, sesiones: 0, api: "caída" };
  }

  const ids = Object.keys(activas);
  for (const sid of ids) {
    try {
      const r = await ocGet("/api/session/" + sid + "/message");
      const msgs = Array.isArray(r.data) ? r.data : [];
      const asistente = [...msgs].reverse().find((m) => m.type === "assistant");
      const id = asistente && asistente.agent;
      if (id && porId[id]) {
        const cl = clasificarMensaje(asistente);
        if (cl) { porId[id].estado = cl.estado; porId[id].ultimaAccion = cl.accion; }
        else { porId[id].estado = "trabajando"; porId[id].ultimaAccion = "en sesión"; }
      }
    } catch (_) {}
  }
  return { agentes, sesiones: ids.length, api: "ok" };
}

/* ---------- Estado global + SSE a los navegadores ---------- */
let ultimoEstado = { type: "estado", ts: 0, agentes: [], sesiones: 0, api: "iniciando" };
const clientes = new Set();

function emitir(obj) {
  const data = "data: " + JSON.stringify(obj) + "\n\n";
  for (const res of clientes) {
    try { res.write(data); } catch (_) { clientes.delete(res); }
  }
}

async function bucle() {
  try {
    const est = await calcularEstados();
    const nuevo = { type: "estado", ts: Date.now(), ...est };
    const firma = JSON.stringify(nuevo.agentes.map((a) => [a.estado, a.ultimaAccion])) + nuevo.sesiones;
    const firmaVieja = JSON.stringify(ultimoEstado.agentes.map((a) => [a.estado, a.ultimaAccion])) + ultimoEstado.sesiones;
    ultimoEstado = nuevo;
    if (firma !== firmaVieja) emitir(nuevo);
  } catch (e) {
    emitir({ type: "aviso", ts: Date.now(), mensaje: String(e.message || e).slice(0, 200) });
  }
  setTimeout(bucle, POLL_MS);
}

/* ---------- Suscripción opcional al SSE de OpenCode (crudo) ---------- */
async function escucharEventos() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10 * 60 * 1000); // renuevo cada 10 min
    const r = await fetch(oc.url + "/api/event", { headers: { Authorization: AUTH }, signal: ctrl.signal });
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const bloque = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const linea = bloque.split("\n").find((l) => l.startsWith("data:"));
        if (linea) {
          const txt = linea.slice(5).trim();
          if (txt && Date.now() - ultimoEstado.ts < EVENT_TTL_MS) {
            emitir({ type: "evento", ts: Date.now(), payload: txt.slice(0, 500) });
          }
        }
      }
    }
    clearTimeout(t);
  } catch (_) {}
  setTimeout(escucharEventos, 5000);
}

/* ---------- Servidor HTTP: estático + SSE ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const servidor = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];

  if (url === "/api/live") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("data: " + JSON.stringify(ultimoEstado) + "\n\n");
    clientes.add(res);
    req.on("close", () => clientes.delete(res));
    return;
  }

  if (url === "/api/estado") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(ultimoEstado));
    return;
  }

  // Estático (con guardia anti path-traversal)
  let rel = url === "/" ? "/index.html" : url;
  const archivo = path.normalize(path.join(WEB_DIR, rel));
  if (!archivo.startsWith(WEB_DIR)) { res.writeHead(403); res.end("403"); return; }
  fs.readFile(archivo, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 — fuera de la carpa"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(archivo).toLowerCase()] || "application/octet-stream" });
    res.end(buf);
  });
});

/* ---------- CLI ---------- */
const arg = process.argv[2];
if (arg === "--stop") {
  try {
    const pid = Number(fs.readFileSync(PID_FILE, "utf8").trim());
    process.kill(pid);
    fs.unlinkSync(PID_FILE);
    console.log("🛑 Relé detenido (pid " + pid + ")");
  } catch (e) {
    console.log("No hay relé en marcha. (" + String(e.message) + ")");
  }
  process.exit(0);
}
if (arg === "--status") {
  try {
    const pid = Number(fs.readFileSync(PID_FILE, "utf8").trim());
    process.kill(pid, 0);
    console.log("🟢 Relé en marcha (pid " + pid + ") → http://127.0.0.1:" + PORT);
  } catch (_) {
    console.log("⚪ Relé detenido");
  }
  process.exit(0);
}

servidor.listen(PORT, "127.0.0.1", () => {
  fs.writeFileSync(PID_FILE, String(process.pid));
  console.log("🎪 Circo en Vivo — relé escuchando en http://127.0.0.1:" + PORT);
  console.log("   OpenCode: " + oc.url);
  console.log("   Pulsa Ctrl+C o ejecuta: node web/relay.js --stop");
  bucle();
  escucharEventos();
});

process.on("SIGINT", () => { try { fs.unlinkSync(PID_FILE); } catch (_) {} process.exit(0); });
process.on("SIGTERM", () => { try { fs.unlinkSync(PID_FILE); } catch (_) {} process.exit(0); });
