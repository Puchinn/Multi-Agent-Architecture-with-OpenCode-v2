#!/usr/bin/env node
/**
 * 🪞 Proxy espejo de Ollama — sólo para diagnóstico.
 *
 *   node web/ollama-proxy.js        # 127.0.0.1:11435 → 127.0.0.1:11434
 *
 * Reenvía TODO lo que llega (API nativa /api/* y compatible /v1/*) sin tocar
 * nada, y anota en web/proxy.log las peticiones que llevan campos de
 * razonamiento/parametrización ("think", "temperature", "options").
 * Sirve para verificar qué manda OpenCode de verdad a Ollama.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 11435;
const UPSTREAM = { host: "127.0.0.1", port: 11434 };
const LOG = path.join(__dirname, "proxy.log");
const INTERES = /"(think|temperature|top_p|options|num_predict)"/;

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (body && INTERES.test(body)) {
      const head = body.slice(0, 400);
      const tail = body.slice(Math.max(0, body.length - 700));
      const linea =
        new Date().toISOString() + " " + req.method + " " + req.url +
        "\n  HEAD: " + head + "\n  TAIL: " + tail + "\n";
      try {
        fs.appendFileSync(LOG, linea);
      } catch (_) {}
    }

    const headers = Object.assign({}, req.headers, {
      host: UPSTREAM.host + ":" + UPSTREAM.port,
    });
    delete headers["content-length"]; // recalculado por forward

    const fwd = http.request(
      Object.assign({}, UPSTREAM, { path: req.url, method: req.method, headers }),
      (r2) => {
        // Si es una respuesta de chat, la memorizamos para inspeccionar
        // si venía "reasoning" (¿el modelo pensó o no?).
        const esChat = req.url.includes("chat");
        if (esChat) {
          const trozos = [];
          r2.on("data", (c) => trozos.push(c));
          r2.on("end", () => {
            const buf = Buffer.concat(trozos).toString("utf8");
            const piensa = /"reasoning"\s*:\s*"[^"]+/.test(buf) || /<think/.test(buf);
            try {
              fs.appendFileSync(
                LOG,
                new Date().toISOString() + " RESPUESTA " + req.url +
                  " · reasoning detectado: " + (piensa ? "SÍ" : "NO") +
                  " · primeros 200: " + buf.slice(0, 200).replace(/\s+/g, " ") + "\n"
              );
            } catch (_) {}
            try {
              res.writeHead(r2.statusCode || 502, r2.headers);
              res.end(buf);
            } catch (_) {}
          });
          return;
        }
        res.writeHead(r2.statusCode || 502, r2.headers);
        r2.pipe(res);
      }
    );
    fwd.on("error", (e) => {
      try {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("proxy error: " + e.message);
      } catch (_) {}
    });
    if (body) fwd.write(body);
    fwd.end();
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("🪞 proxy Ollama: http://127.0.0.1:" + PORT + " → " + UPSTREAM.host + ":" + UPSTREAM.port);
  console.log("   log de parámetros: " + LOG);
});
