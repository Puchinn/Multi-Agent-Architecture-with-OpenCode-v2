# 🎪 PLAN — Página Web "Circo en Vivo" (Visualización de Agentes)

> **Estado:** 🟢 **EN MARCHA** — Fase 0 ✅ (reconocimiento real: auth Basic `opencode:PW` en `127.0.0.1:49374`, SIN CORS → relé obligatorio; `/api/session/active` y `/api/session/{id}/message` con campo `agent` + tool states listos) · Fase 1 ✅ (prototipo estático en `web/`, construido y verificado por El Aprendiz) — siguiente: Fase 2 (relé en vivo).
> **Creado:** 8 de Octubre de 2026 · **Autor:** Director de Orquesta (`director`)

---

## 🎯 Objetivo

Generar una página web con **HTML, CSS y JavaScript** que visualice el flujo de los agentes del Circo Gran Fantasía como si fuera un circo en escena: el Director, el Presentador, Polvorita y Don Barnaby trabajando en vivo, sus tareas, movimientos y estado actual.

**Veredicto de viabilidad: 8,5/10 — totalmente viable** con las herramientas que OpenCode ya expone.

---

## 🔌 Fuentes de datos confirmadas (verificadas en la API de OpenCode)

| Qué necesitamos | Endpoint | Estado |
|:--|:--|:-- |
| Lista de agentes (con color) | `GET /api/agent` → `Agent.Color` | ✅ |
| Sesiones activas (¿quién trabaja?) | `GET /api/session/active`, `GET /api/session` | ✅ |
| Qué está haciendo cada uno | `GET /api/session/{id}/message` (tool states: `Running`/`Streaming`/`Completed`/`Error`) | ✅ |
| Eventos en vivo (SSE) | `GET /api/event` | ⚠️ Experimental |
| Skills / comandos en uso | `GET /api/skill`, `GET /api/command` | ✅ |
| Stock de la bodega | Supabase REST `/rest/v1/inventario_items` | ✅ (vía relé por RLS) |

---

## 🏗️ Arquitectura propuesta (3 capas)

```
OpenCode server (ya corriendo)
   │  SSE /api/event  (via @opencode/client)
   ▼
Relé local en Node (127.0.0.1:7777)
   │  SSE propio + service_role key (nunca al navegador)
   ▼
Página web estática: carpa HTML/CSS/JS
```

- **Por qué un relé:** el server de OpenCode usa descubrimiento/auth y `EventSource` no manda headers; además la llave `service_role` de Supabase no debe llegar al navegador.
- **Plan B (más simple):** página estática que sondea `/api/session/active` cada 2-3 s (pierde el "en vivo"; verificar CORS/auth antes).

---

## 🎨 Diseño de la escena

- **Pista central:** 4 personajes con animación de estado (idle / trabajando / error).
- **Bambalinas:** burbujas con la última acción (tool states).
- **Cartel de boletería:** skills y comandos activos (`/funcion`, `/ensayo`).
- **Panel de bodega:** tabla de `inventario_items` con pesos (via relé).
- **Zócalo:** últimas entradas de `MEMORY.md` como "programa de mano".

---

## ⚠️ Riesgos y decisiones pendientes

1. `/api/event` es **experimental** → aislar el payload en un solo módulo del relé.
2. **El Director no tiene shell:** quien arranque relé y servidor web será el usuario, salvo permiso explícito.
3. **RLS cerrado** en `inventario_items`: el relé lee con `service_role`; política `anon` de SELECT sólo si el público lo autoriza.
4. **Subagentes en sesiones hijas:** verificar el payload real antes de diseñar animaciones (Fase 0).

---

## 🗓️ Plan por fases

| Fase | Contenido | Esfuerzo |
|:--|:--|:--|
| **0. Reconocimiento** | Probar `api/info`, `api/event`, listar sesiones activas y ver el formato real | minutos |
| **1. Prototipo estático** | `index.html` + CSS + JS con datos simulados (la carpa se ve y se mueve) | una tarde |
| **2. Relé en vivo** | Node + `@opencode/client` → SSE → estados reales de los 4 agentes | 1-2 sesiones |
| **3. Bodega y bitácora** | Panel de stock (Supabase vía relé) + últimas entradas de `MEMORY.md` | media sesión |
| **4. Ambientación** | Animaciones, efectos `[¡Honk honk!]`, sonido al terminar una tarea | a gusto |

**Recomendación al retomar:** empezar por **Fase 0 + 1** (ver la carpa con datos falsos el mismo día) y luego enganchar el relé sin rehacer el diseño.

---

## 📌 Cómo retomar este plan

1. **Leer este archivo** (`PLAN-WEB-CIRCO.md`) + `MEMORY.md` (buscar "Migración #1" y el estado de la gira).
2. **Cargar la skill `opencode`** y confirmar la referencia de la API (`/api/event`, sesiones, agentes) — la API es experimental y puede cambiar.
3. **Ejecutar la Fase 0:** `opencode api get /api/info` y `opencode api get /api/event` (o vía HTTP) para ver los payloads reales antes de diseñar nada.
4. **Crear la carpeta** `web/` en la raíz del proyecto para el prototipo (Fase 1: `index.html`, `styles.css`, `app.js` con datos simulados).
5. **Registrar el inicio** en `MEMORY.md` como nueva entrada de función/ensayo.
