# 📖 Bitácora Oficial de la Orquesta: Circo "Gran Fantasía"

Este archivo es mantenido exclusivamente por el **Director de Orquesta**. Aquí se registran los eventos clave, las preferencias del público, el estado de la gira y las observaciones sobre el desempeño del elenco.

---

## 📍 Estado Actual de la Gira

- **Ubicación Actual:** Río Segundo, Córdoba.
- **Estado del Elenco:** Inventario migrado a Supabase (`inventario_items`, 10 ítems, 626,9 kg). `inventario.json` archivado como legacy. Función #002 (Halloween) estrenada; arnés `UTL-009` operativo. Pendiente: puntales `UTL-008`.
- **Animo General:** Entusiasta, con ganas de probar la coordinación multi-agente.

---

## 📑 Historial de Funciones e Interacciones

### 🎭 Función #000 - Ensayo Técnico e Inauguración de Bitácora

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director de Orquesta (`director`)
- **Resumen:**
  - Se estableció la estructura global del circo y las reglas en `AGENTS.md`.
  - Se creó esta bitácora inicial para llevar el registro continuo de la gira.
- **Notas del Director:**
  - _El elenco está listo en bambalinas. A la espera de configurar a Polvorita, el Maestro de Ceremonias y el Utilero._

### 🎭 Función #001 - Montaje del Elenco y Contexto del Inventario

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director de Orquesta (`director`)
- **Resumen:**
  - Se formalizaron los agentes en `.opencode/agents/` (`director`, `presentador`, `payaso`, `utilero`) con sus frontmatter de permisos.
  - Se registraron los comandos `/funcion` y `/ensayo` (`.opencode/commands/`) y la skill `cartelera-circense`.
  - Se creó la skill **`inventario-tecnico`** (`.opencode/skills/inventario-tecnico/SKILL.md`) con la estructura, campos y reglas de `inventario.json` (formato `version: 1`, IDs `UTL-###`, escritura exclusiva del Utilero).
- **Notas del Director:**
  - _Don Barnaby aún no ha dado de alta el archivo `inventario.json`; quedó pendiente su primera ronda de stock._
  - _Revisar que el `utilero` tenga edición restringida a `inventario.json` si el público lo desea (hoy tiene edición global `_`)._

---

### 🎭 Ensayo General #1 - Primer Pase Completo del Elenco

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), Presentador, Payaso Polvorita, Utilero (Don Barnaby)
- **Resumen:**
  - **Pase de lista:** el Maestro de Ceremonias dio el saludo inicial de ensayo con bienvenida al público de Río Segundo.
  - **Prueba del Payaso:** Polvorita calentó con su rutina del funambulista + tropiezos (`¡Honk honk!`).
  - **Revisión técnica:** escenario, trapecio y pista **listos**. Visto bueno *condicionado* a la creación de `inventario.json`.
- **Veredicto del Director:** 🟡 Aprobado con una observación — el elenco está en forma; falta el inventario de bodega antes del estreno.
- **Pendiente:** Crear `inventario.json` (primer stock) para convertir el visto bueno en luz verde definitiva.

---

### 🔧 Ronda de Stock #1 - Alta del Inventario

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), Utilero (Don Barnaby)
- **Resumen:**
  - Se creó `inventario.json` (raíz del proyecto) siguiendo la skill `inventario-tecnico`: `version 1`, fecha 2026-10-08, **10 ítems** (`UTL-001` a `UTL-010`).
  - **Peso total operativo: 626,9 kg** (ítems no dados de baja). Categorías: acrobacia, utilería, disfraz, sonido, iluminación, carpa, seguridad.
  - Ítems destacados: `UTL-009` arnés acrobático **en_reparacion** (costuras del nº3; prohibido subir al trapecio con él) y `UTL-010` taburete **dado_de_baja** (se conserva con `cantidad: 0` por trazabilidad).
- **Veredicto del Director:** 🟢 La observación del Ensayo #1 queda subsanada — visto técnico en luz verde.
- **Pendiente:** Reparación y firma de revisión del arnés `UTL-009` antes de números aéreos; lijar/pintar puntales `UTL-008` en la próxima parada.

---

### 🛠️ Inspección Técnica #1 - Skills Supabase y MCP Conectado

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director de Orquesta (`director`)
- **Resumen:**
  - Se instalaron 2 skills nuevas desde `supabase/agent-skills` (registradas en `skills-lock.json` v1): **`supabase`** (0.1.2) y **`supabase-postgres-best-practices`** (1.1.1), en `.agents/skills/`.
  - Se conectó el **MCP de Supabase** vía `opencode.json` → `http://127.0.0.1:54321/mcp` (habilitado). Conexión **verificada en vivo**: `list_tables`, `list_migrations`, `list_extensions` responden.
  - Stack local `orquesta`: Postgres 17, API :54321, DB :54322, Studio :54323; Auth/Realtime/Storage/Edge activos.
  - Estado de la BD: **0 tablas** en `public`, **0 migraciones** (recién inicializada); extensiones estándar de Supabase disponibles.
- **Observaciones del Director:**
  - _Aún no se ha definido el caso de uso de la base de datos (boletería, inventario en la nube, agenda...). Cargar `supabase-postgres-best-practices` antes de la primera migración, según su propia regla._

---

### 🗄️ Migración #1 - El Inventario Cruza a Supabase

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), Utilero (Don Barnaby, comportamiento reescrito)
- **Resumen:**
  - Cargadas las skills `supabase` + `supabase-postgres-best-practices` antes de tocar nada (como exigen sus propias reglas).
  - **Diseño nuevo** (aplicando `schema-data-types`, `schema-constraints`, `schema-lowercase-identifiers`): PK `bigint identity` + `codigo text UNIQUE` (`UTL-###` con CHECK regex), `categoria`/`estado` con CHECK, `cantidad ≥ 0`, `peso_kg numeric(6,2) ≥ 0`, `timestamptz` con trigger de `updated_at`, identificadores `snake_case`.
  - **Seguridad:** RLS activado **sin políticas públicas** (sólo nosotros) — decisión del público. Advisors corridos: WARN de `search_path` mutable **corregido** (`set search_path = ''`); 2 INFO esperables (RLS sin política = puerta cerrada por diseño; índice recién creado).
  - **Workflow:** iteración libre con `execute_sql` → pruebas (CHECKs rechazan estados/códigos inválidos ✅, trigger dispara ✅) → limpieza → **única** `apply_migration` `20261008170011_create_inventario_items`.
  - **Volcado verificado:** 10 ítems (`UTL-001`…`UTL-010`), peso total **626,90 kg** — cuadra exacto con el JSON.
  - Archivos reescritos: skill `inventario-tecnico` (ahora apunta a la tabla), `.opencode/agents/utilero.md` (nuevo flujo MCP), `AGENTS.md` (regla de permisos actualizada).
  - **`inventario.json` archivado como legacy: sólo lectura, no se edita más.**
- **Notas del Director:**
  - _Comportamiento nuevo del Utilero: `execute_sql` para operar; DDL sólo con mi visto bueno y previa carga de ambas skills; anti-bucle (2-3 fallos → parar); verificación obligatoria; traza a `MEMORY.md`._

---

### 🤖 Modelo Local #1 - El Aprendiz Entra al Circo

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (nuevo, `aprendiz`)
- **Resumen:**
  - **Fase 0 (prueba de fuego):** Ollama corriendo con `qwen3.8:latest` (27,3B, Q4_K_M, 17,6 GB VRAM, 72k ctx). Tool-calling **aprobado** en ambos modelos probados (JSON y nombre impecables); en caliente qwen3.8 respondió en **1,8 s**. `qwen3-coder:latest` **descartado por decisión del público** (se archiva; sólo cabe uno en VRAM a la vez).
  - **Fase 1 (integración):** OpenCode **auto-descubre** Ollama (`127.0.0.1:11434`) — `ollama/qwen3.8:latest` ya aparece como modelo activo. No hizo falta tocar `opencode.json`.
  - **Fase 2 (agente):** creado `.opencode/agents/aprendiz.md` — `mode: subagent`, `model: ollama/qwen3.8:latest`, **`steps: 12`** (pasos duros; al llegar, OpenCode le quita las herramientas y obliga a resumir), permisos de contención (todo denegado → lectura + escritura **sólo en `borradores/**`**), regla 2-3 antibucle, verificación obligatoria y cierre con veredicto `✅/⚠️/❌`.
  - Nuevo directorio `borradores/` con su README; fila del Aprendiz añadida a la jerarquía en `AGENTS.md`.
- **Notas del Director:**
  - _El agente puede requerir recarga de la sesión/servidor de OpenCode para aparecatálogo de subagentes — verificar con un ensayo antes del primer encargo real._
  - _Pendiente de ensayo: primera tarea acotada del Aprendiz con supervisión mía._

---

### 🎓 Ensayo del Aprendiz #1 - Primer Pase Aprobado

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`)
- **Resumen:**
  - Tarea acotada: leer `MEMORY.md` y escribir `borradores/informe-estado.md` (≤10 líneas) con veredicto final.
  - **Resultado:** ✅ APROBADO — 9 líneas, contenido fiel a la bitácora (verificado línea por línea por el Director), escritura exclusiva en `borradores/**`, formato `✅ HECHO` con verificación declarada (relectura del archivo).
  - El agente respondió con el modelo local `ollama/qwen3.8:latest` sin deriva ni alucinaciones de cifras.
- **Notas del Director:**
  - _El Aprendiz queda **habilitado para tareas acotadas** bajo supervisión. Siguiente paso cuando el público lo pida: tarea de código real en `borradores/` (aún no probado con contenido programático)._

---

### 📖 Folleto #1 - README para GitHub

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director de Orquesta (`director`)
- **Decisiones del público:** español, tutorial completo copia-pega, **sin** roadmap ni licencia por ahora (sólo lo actual).
- **Resumen:**
  - Creado `README.md`: características, arquitectura, requisitos (OpenCode obligatorio; Supabase CLI/Docker y Ollama+GPU opcionales), puesta en marcha en 3 pasos con verificaciones, uso, tabla de agentes, esquema del inventario, modelo local, estructura y permisos.
  - **Huecos de reproducibilidad tapados:** creado `.gitignore` (excluye `supabase/.temp/` con sus secretos locales 🚨), `supabase/migrations/20261008170011_create_inventario_items.sql` y `supabase/seed.sql` — ahora `supabase db reset` funciona desde un clon limpio.
- **Notas del Director:**
  - _Pendiente antes de publicar: `git init`, revisión de qué se sube, y que el público cree el repo en GitHub con la URL definitiva (el README lleva `<tu-usuario>` como placeholder)._

---

### 🌐 Web #1 - Circo en Vivo: Fases 0 y 1

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`)
- **Resumen:**
  - **Fase 0 (reconocimiento real):** servidor OpenCode v2.0.25 en `http://127.0.0.1:49374` — autenticación **Basic** (`opencode:<service password>`, hallada en `~/.local/state/opencode/service.json`). **Sin cabeceras CORS** → el relé (Fase 2) es obligatorio. Payloads confirmados: `/api/session/active` (`{ses_id:{type:"running"}}`), `/api/session/{id}/message` (campo `agent` + `content[]` con reasoning/tool states), `/api/event` SSE callado en reposo (latirá con actividad).
  - **Fase 1 (prototipo):** ampliados los permisos del Aprendiz (`borradores/**` **+ `web/**`, actualizado `AGENTS.md`) y delegada la construcción: `web/index.html`, `web/styles.css`, `web/app.js` — escena con 5 personajes (estados idle/trabajando/error), burbujas de actividad, cartel de boletería, panel de bodega y zócalo de bitácora; simulador de estados cada 4 s; **100% offline** (0 referencias externas).
  - Verificación independiente del Director: enlaces, ausencia de red y 5/5 personajes — todo correcto. El Aprendiz cerró con `✅ HECHO` + verificación declarada.
- **Notas del Director:**
  - _Pendiente Fase 2: relé Node (Basic auth + SSE → la página); sólo el público puede lanzarlo (Director sin shell). El prototipo se abre con doble clic en `web/index.html`._

---

### 🎃 Función #002 - Noche de Halloween

- **Fecha:** 8 de Octubre de 2026
- **Temática:** Halloween
- **Agentes Involucrados:** Director (`director`), Presentador, Payaso Polvorita
- **Resumen:**
  - **Presentador:** bienvenida oficial solemne con bombos y platillos; presentó la Noche de Halloween y anunció los números.
  - **Payaso Polvorita:** rutina estelar temática (vampiro/dentista, fantasma "no me espíres", calabaza gigante, lluvia de caramelos "dulce o truco") con gag físico de escoba voladora y caída en almohadones.
  - **Cierre:** orquesta al máximo, despida al público de Río Segundo.
- **Observaciones del Director:**
  - Número de acrobacias anunciado por el Presentador **no llegó a montarse** en escena; considerarlo para la próxima función.
  - El Utilero no participó (sin cambios de inventario durante la función); `UTL-009` sigue en reparación — sin números aéreos que lo exijan, todo conforme.

---

### 🔧 Faena #1 - Reparación del Arnés `UTL-009`

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), Utilero (Don Barnaby)
- **Resumen:**
  - `UTL-009` (arnés acrobático homologado) pasa de `en_reparacion` a **`operativo`**: costuras del nº3 rehechas con doble pespunte y refuerzo en puntos de carga, prueba de carga y revisión firmadas por Don Barnaby el 08/10/2026.
  - `cantidad` verificada en **5** (12,5 kg). Sólo se tocó este ítem; JSON validado (10 ítems, estructura intacta).
- **Observaciones del Director:**
  - **Queda levantada la restricción de números aéreos:** el trapecio puede volar de nuevo.
  - Pendiente restante de la lista técnica: lijar/pintar puntales `UTL-008` en la próxima parada.

---

### 🌐 Web #2 — Fase 2: el Relé Enciende la Carpa

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`)
- **Resumen:**
  - **Shell acotado concedido** al Director (`.opencode/agents/director.md`: deny global + allow `node -v` / `node web/relay.js*`); Node **v24.18.0** en el PATH.
  - Escrito `web/relay.js` por el Director (Node puro, sin dependencias): sirve `web/` en `127.0.0.1:7777`, sondea la API de OpenCode (Basic auth) y emite SSE en `/api/live`; CLI con `--status` y `--stop`.
  - Fase 2 cableada en `web/app.js` (`conectarRelé`, indicador 🟢EN VIVO / 🟡SIMULADO / 🔴SIN SEÑAL, contador de sesiones, feed seguro sin `innerHTML`) — obra **híbrida**: cimientos del Aprendiz + cableado del Director.
  - **Relé arrancado y verificado en vivo** (pid 49368): HTTP 200 en `/`, `/api/estado` con datos reales (`api: "ok"`, `sesiones: 1`, Director "trabajando"). Doble clic en `index.html` sigue en modo SIMULADO (`file://` no admite `EventSource`) — comportamiento deseado, 100% offline.
- **Averías de la noche:**
  - El Aprendiz volvió **mudo 2 veces** (sin veredicto `✅/⚠️/❌`): `steps: 12` agotados a mitad de faena; su trabajo parcial era correcto y válido.
  - El Director (MiMo) emitió **tool-calls como texto crudo** 2 veces seguidas → interrupción de la sesión anterior.
- **Arreglos aplicados:** `steps: 12 → 20`; regla de **presupuesto de pasos** (los 2 últimos reservados para el veredicto); regla de arena corregida (`borradores/**` + `web/**`); nueva **Ley anti-sobrepensamiento** (5 reglas: decidir en ≤3 líneas, no cuestionar el encargo, un solo plan, verificar lo tocado, ediciones grandes).
- **Pendiente:** probar EN VIVO en el navegador (`http://127.0.0.1:7777`); decidir si se inyecta `body: {"think": false}` a `ollama/qwen3.8:latest` en `opencode.json` (probado **directo en Ollama: funciona** — sin reasoning); commit de `web/`, la bitácora y las dos transcripciones.

---

### 🧪 Experimento #1 — El Botón de Pensar del Aprendiz

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`, 3 despachos con la variante)
- **Resumen:**
  - Creado en `opencode.json` → `providers.ollama.models["qwen3.8:latest"]` con variante **`#sin-pensar`** (`body: {"think": false}`), `limit.context: 72000` y `capabilities.tools: true`. Catálogo verificado: la variante registra correctamente.
  - Construido **`web/ollama-proxy.js`** (proxy espejo 11435 → 11434, sólo diagnóstico) para observar el tráfico real.
  - **Hallazgo 1 ✅:** OpenCode **sí envía** `"think": false` en cada petición (`POST /v1/chat/completions`) — la cadena `opencode.json → variante → provider` funciona.
  - **Hallazgo 2 ❌:** Ollama **ignora** `think` en el endpoint *OpenAI-compatible* que usa OpenCode (la respuesta traía `reasoning` de 98 caracteres). En la **API nativa `/api/chat` sí lo respeta**: con `think: false` el campo `thinking` desaparece por completo.
  - **Hallazgo 3 ✅ (la solución):** el endpoint *compat* entiende **`reasoning_effort`** (`"none"`/`"low"`/`"medium"`/`"high"` — issue oficial ollama/ollama#14820, ausente de la lista documentada de campos). Prueba directa: `"none"` → `reasoning` de **0 caracteres**; `"low"` → 81; sin campo → 109.
  - **Prueba de punta a punta:** variante corregida a `{"think": false, "reasoning_effort": "none"}` + proxy espejo → **4/4 peticiones con el campo y 4/4 respuestas sin razonamiento**.
  - **Comandos de Ollama para el razonamiento (docs oficiales):** CLI `ollama run <modelo> --think` / `--think=false` (y `--hidethinking`); sesión interactiva `/set think` y `/set nothink`; API nativa `think: false|true|"low"|"medium"|"high"|"max"`; endpoint *compat* `reasoning_effort`. No hay interruptor permanente por comando: es por petición (el Modelfile no se verificó).
  - **Buen resultado del Aprendiz: 4/4 veredictos `✅`** con `steps: 20` + presupuesto de pasos + Ley anti-sobrepensamiento (cuenta mental `619,4 kg` correcta; archivos creados y editados sin una sola repetición de intento — la 4ª prueba corrió ya **sin razonamiento** y también cerró limpio).
- **Limpieza:** retirado el `baseURL` del proxy de `opencode.json`; proxy detenido; `proxy.log` borrado. Se conserva `web/ollama-proxy.js` como herramienta de diagnóstico. Variantes activas: **`#sin-pensar`** (`none`) y **`#poco-pensar`** (`low`).
- **Pendiente (decisión del público):** si el Aprendiz debe usar una de estas variantas **por defecto** en su cartilla, o seguir pensando por defecto y usarlas sólo en tareas mecánicas.

---

### 🎓 Ensayo del Aprendiz #2 — Tarea Mediana de Código en Modo «Sin Pensar»

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`, despacho con variante `ollama/qwen3.8:latest#sin-pensar`)
- **Encargo:** «Filtro de bodega» — editar 3 archivos existentes de la web (`web/index.html`, `web/app.js`, `web/styles.css`): campo de búsqueda con `label`, filtrado por `codigo`/`nombre` insensible a mayúsculas **y acentos**, totales del `<tfoot>` sólo de lo visible, fila «Sin resultados» con `colspan=5`, contador «N de 5 ítems», listener `input` sin debounce, estilos con las variables del tema.
- **Resultado:** ✅ APROBADO — primera tarea mediana de código resuelta de punta a punta.
  - **Verificación independiente del Director (4 pruebas):** `node --check web/app.js` → sintaxis OK; prueba funcional de la lógica con `node -e` → `«arnes»` encuentra «Arnés acrobático homologado» (1 ítem · 5 uds · 12,5 kg), `«UTL-00»` → 3 ítems · 18 uds · 62,3 kg, `«xyz»` → 0 con totales en 0; ids `buscar-bodega`/`contador-bodega` coincidentes HTML↔JS y `label[for]` correcto; CSS sólo con variables existentes (`--oro`, `--papel*`, `--borde`, `--fuente-cuerpo`); sin resultados vía `textContent` (sin inyección).
  - **Área de arena respetada:** huellas de modificación confirman que sólo se tocaron los 3 archivos permitidos.
  - **Conducta:** cerró con veredicto `✅ HECHO` + verificación declarada, sin quedarse mudo ni repetir enfoques, con nota honesta de que sin shell no podía probar en navegador.
- **Notas del Director:**
  - _La variante **`#sin-pensar`** demostró ser usable en edición de código real: no se traba, no divaga y entrega trabajo funcional. Candidata firme para ser su modo por defecto en tareas mecánicas/estructuradas._
  - _Pendiente (decisión del público): hacer la misma tarea con el modelo pensando para tener línea base y comparar velocidad/calidad._

---

### 🔍 Inspección Web #1 — Auditoría en Vivo con DevTools (MCP chrome-devtools)

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), usando el nuevo MCP **chrome-devtools** (navegación, snapshot a11y, `evaluate_script`, red, consola, capturas) contra `http://127.0.0.1:7777` (relé activo).
- **Averías tras bambalinas (feed «Bambalinas»):**
  - **Inundación de JSON crudo:** `relay.js` reenvía *cada* evento del SSE de OpenCode (`{type:"evento", payload: 500 chars}`) y `app.js` lo vuelca truncado a 120 chars → `📡 evento OpenCode: {"id":"evt_…","type":"session.reasoning.delta"…`. Muestra: **30/30 entradas eran JSON**; un mensaje útil inyectado a mano fue **expulsado en <1 min** (FEED_MAXIMO=30).
  - **Ráfagas:** 15 tipos de evento distintos en una ventana de 30; `reasoning.delta`/`text.delta`/`tool.progress` dominan; ~8-10 eventos/segundo mientras el Director escribe (ventana tranquila = 0). 30 líneas reparten sólo **6 marcas de tiempo distintas** (segundos), orden ilegible.
  - **`aria-live="polite"` en el feed** → lectores de pantalla anuncian cada línea de JSON.
  - El campo **`api` del relé (`ok`/`caída`/`iniciando`) la página lo ignora**: si la API de OpenCode muere, la cabecera sigue en 🟢 EN VIVO (el SSE del relé vive) aunque las tarjetas pasen a «desconectado».
  - Fuga parcial de `location.directory` (ruta Windows) e IDs internos (`evt_`, `ses_`) en el feed público.
- **Inventario estático vs. interactivo:** **0 botones, 1 input** en toda la página. Chips de Boletería (`cursor:auto`, sin `tabindex`), cabeceras de tabla **no ordenables**, filas de bodega/tarjetas de agentes/bitácora/badge de estado: todos `cursor:auto` → candidatos a interacción. Único interactivo real: el filtro de bodega.
- **Comprobado ✅ (en navegador):** filtro de bodega impecable («arnes»→1 fila/12,5 kg; «UTL-00»→3/62,3; «zzz»→fila de aviso; contador y totales correctos); el simulador **descansa en modo EN VIVO** (`tick()` retorna si `MODO_ACTUAL==="vivo"`); 100% offline (sólo 4 peticiones locales).
- **Avería menor:** `GET /favicon.ico → 404` (único error de consola).
- **Notas del Director:**
  - _Pendiente de decisión del público: capa de traducción/agrupación de eventos en `manejarMensajeRelé` (frases humanas + ráfagas agrupadas + canal técnico aparte), mostrar `api`/última actualización en la cabecera, y controles de pausa/filtro en el feed._

---

### 🎛️ Auditoría Web — Tarea 1 «Traductor de bambalinas»

- **Fecha:** 8 de Octubre de 2026
- **Agentes Involucrados:** Director (`director`), El Aprendiz (`aprendiz`, variante `#sin-pensar`)
- **Encargo:** en `web/app.js` (archivo único), traducir los eventos crudos del relé a frases humanas (`session.reasoning→pensando…`, `text→escribiendo…`, `tool→usando herramienta…`, `step→avanzando de paso…`, `usage→registrando consumo…`, fallback `evento interno…`) y **agrupar ráfagas** (mismo grupo en la primera línea → contador `· ×N` vía `dataset.grupo`/`dataset.contador`), sin `innerHTML` con dato externo.
- **Resultado:** ✅ APROBADO — verificación del Director en 3 tiempos: `node --check` OK · lectura de código (parseo con `try/catch`, `FEED_MAXIMO` respetado, `agregarFeed`/`pintar*` intactos) · **prueba en navegador** con mensajes sintéticos: ráfaga de 5 → `×5`; cambio de grupo → línea nueva; payload roto → `evento interno…` agrupado; `aviso` y `estado` intactos (sesiones=7, tarjeta Director actualizada); inundación de 40 → tope 30; **cero JSON crudo en pantalla**.
- **Prueba real:** durante la escritura del Director, **57 `session.reasoning.delta` → 1 línea** `pensando… · ×57` (antes: 57 líneas de JSON que expulsaban todo).
- **Observación menor (para la Tarea 3):** al agrupar, `li.textContent = …` destruye el elemento `<time>` de la línea (queda el texto visible, pero sin la etiqueta semántica).
- **Notas del Director:**
  - _El Aprendiz, sin razonamiento, implementó exactamente el patrón de estado sugerido a la primera. Ritmo de la auditoría: 1 tarea = 1 despacho = verificación con puerta._

---

### 🎛️ Auditoría Web — Tarea 2 «Insignia honesta»

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director, El Aprendiz (`#sin-pensar`)
- **Encargo:** mostrar en la cabecera el campo `api` que el relé ya manda (`ok`/`caída`/`iniciando`) + frescura («hace N s»), con 3 clases CSS de color.
- **Resultado:** ✅ APROBADO — verificado en navegador: `⏳ API: iniciando · sin señal` (espera) → `⚠️ API: caída · hace 0 s` (rojo, tarjeta del Director en error) → `🧠 API: ok · hace 0 s` (verde) → a los 4 s `hace 4 s` (el `setInterval` de 1 s late). Colores reales: verde `rgb(76,175,125)`, rojo `rgb(242,184,184)`, ámbar `rgb(240,217,124)`. `contador-sesiones` y tarjetas intactos. **La cabecera ya no miente.**

---

### 🎛️ Auditoría Web — Tarea 3 «Controles de bambalinas»

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director, El Aprendiz (`#sin-pensar`)
- **Encargo:** barra de controles en el feed (Pausar/Reanudar con cola FIFO, Limpiar, filtro «sólo mensajes del circo» vía clase CSS) + micro-arreglo: conservar el `<time>` al agrupar ráfagas.
- **Resultado:** ✅ APROBADO — verificado en navegador con mensajes sintéticos: en pausa el feed queda en **0** tras inyectar 4 mensajes; al reanudar se vuelcan en orden correcto (lo último arriba) **y agrupados** (`escribiendo… ×2`); todas las líneas conservan `<time>`; el filtro deja visibles 2 (circo + aviso) y oculta 2 eventos; Limpiar → 0; `cursor: pointer` en los 3 controles; `node --check` OK.
- **Nota:** con esto la página deja de tener «0 botones»: ya hay 2 + 1 checkbox.

---

### 🎛️ Auditoría Web — Tareas 4, 5 y 6 (cierre)

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director, El Aprendiz (`#sin-pensar`, 3 despachos)
- **Tarea 4 «Orden de bodega»:** ✅ APROBADO — cabeceras como `<button data-campo>`; `pintarBodega()` ordena **después** del filtro (numérico para `cantidad`/`peso_kg`, `localeCompare("es")` para texto, estable); `aria-sort` (`none`/`ascending`/`descending`) + indicador `▲/▼`; listener delegado único en `thead`. Verificado en navegador: `[0,1,2,5,12]` asc/desc, `[45,8,3,5,2,5,0,4]`, alfabético en `es`, **filtro + orden simultáneos** con totales intactos (18 uds · 62,3 kg con «UTL-00»; 20 uds · 78,3 kg al limpiar).
- **Tarea 5 «Boletería y zócalo clicable»:** ✅ APROBADO — chips ahora `<button>` con `aria-pressed` + panel `#detalle-boleteria` (sólo `textContent`), re-pulsar limpia; bitácora en `<details>/<summary>` con `<time datetime="2026-10-08">` (abre/cierra sin JS). Clics probados en vivo; sin regresiones.
- **Tarea 6 «Favicon sin 404»:** ✅ APROBADO — `<link rel="icon" href="data:image/svg+xml,…">` inline (carpa, percent-encoded, comillas simples) + `theme-color`. Recarga sin caché: **sólo 4 peticiones, todas 200, consola vacía** (desapareció el `favicon.ico → 404`) y el SVG **decodifica 150×150**.
- **Estado de la insignia con señal real:** `🧠 API: ok · hace 61 s` (badge-api-ok) — la frescura refleja que el relé sólo emite `estado` al cambiar la firma; al conectar manda el último estado (`relay.js:204`), así que una recarga nunca queda ciega.
- **Balance del Aprendiz en modo `#sin-pensar` (6 despachos):** **6/6 aprobados, 6/6 al primer intento** — sin bucles, sin quedarse mudo, sin agotar pasos, siempre cerró con veredicto y verificación declarada correcta. Verificación del Director en cada puerta: `node --check` + pruebas sintéticas y reales en el navegador con DevTools.
- **Resultado global de la auditoría:** feed con traducción + agrupación (57 ráfagas → 1 línea), insignia honesta, controles de pausa/filtro/limpiar, orden con `aria-sort`, chips y zócalo interactivos, consola limpia. De «0 botones» a **7 elementos interactivos**.
- **Pendientes del público:** decidir si `#sin-pensar` pasa a ser su modo por defecto; hacer `git init` + commit de toda la faena; valorar si el canal técnico de eventos (JSON crudo) se necesita en algún panel aparte.

---

### 📊 Balance de Rendimiento — Aprendiz vs. Director (datos de la API)

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director (consulta de `/api/session`)
- **Las 6 tareas de auditoría (Aprendiz, `#sin-pensar`):** **1.123.004 tokens** en total — sólo **135.869** de entrada fresca + **18.693** de salida + 968.442 de caché; **razonamiento: 0** (la variante funcionó en producción). Duración por despacho: **583 s (9 min 43 s)** — mín 34 s (favicon), máx 176 s (boletería). Coste: **0 $** (GPU local).
- **Sesión del Director (la de hoy):** ~3,88 M tokens (3,71 M caché + 115 k entrada + 28 k salida + 29 k razonamiento) en 97 min. **Total del Director en el día: ~20,15 M, de los cuales el 95,5 % son lecturas de caché** (releer el contexto creciente en cada vuelta), no pensamiento nuevo.
- **Reparto:** el Aprendiz absorbió el **100 % de la producción de código** con el **5,6 %** de los tokens del día; la factura pesada la tiene la verificación y el contexto del Director.
- **Lectura del Director:** el ahorro real no está en el GPU (gratis), sino en que **6 despachos introdujeron ~5 k de veredictos a mi contexto** en vez de ~40-60 k de ediciones y lecturas en línea — y cada token que entra a mi contexto se relee en cada vuelta posterior (efecto multiplicador de la caché).
- **Conclusión operativa:** al Director le conviene delegar la **escritura mecánica** y quedarse con arquitectura, verificación y decisión; **mayor optimización posible: dar al Aprendiz una herramienta de verificación (`node --check`)** para que no recaiga toda la validación en el Director. → *Ejecutado el mismo día (ver Tarea 7).*

---

### 🔧 Tarea 7 — «Contador de eventos» + Estreno de la Herramienta del Aprendiz

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director, El Aprendiz (`#sin-pensar`)
- **Cambios de cartilla:** `.opencode/agents/aprendiz.md` → permiso **`shell: node --check *`** (su único shell), regla 3 del protocolo ahora **exige pegar la salida literal** en el veredicto, límites de arena actualizados; fila del Aprendiz corregida en `AGENTS.md` (`steps: 12` → `20` + nota de la herramienta).
- **Encargo:** contador `📡 eventos: N` en la barra de bambalinas — cuenta **eventos, no líneas** (los agrupados `×N` valen 1 cada uno), congelado en pausa vía compuerta `publicar()`, con pastilla `.contador-eventos` a tono.
- **Resultado:** ✅ APROBADO — verificación en tres frentes:
  - **Herramienta real (no alucinada):** la sesión del Aprendiz contiene `shell {"command":"node --check web/app.js"}` en estado **`completed`**. Cronología por `time.ran`: ediciones `305,35 s` → **check `309,56 s` (después de editar, como manda la regla)** → relectura final `312,63 s`.
  - **Independiente:** `node --check web/app.js` del Director → OK.
  - **Navegador:** `eventos: 2` (reales) → +5 → `7` → **pausa → sigue `7`** → reanudar → `10` con la línea agrupada `×8`; sin regresiones (chips, orden, `details`, insignia).
- **Nota del Director (autocrítica):** lo acusé de haber chequeado *antes* de editar basándome en el orden del array de mensajes; **las marcas de tiempo lo desmintieron**. Lección: aquí se juzga con `time.ran`, no con el orden de lectura.

---

### 📦 Control de Versiones — Commit de la Faena

- **Fecha:** 8 de Octubre de 2026 · **Agentes:** Director (`director`), shell propio
- **Estado previo:** `git init` + commit inicial hechos por el público (`bf2112e`), pero **toda la faena del día iba sin commitear** — `web/` entero sin trackear y 6 archivos modificados en caliente.
- **Prevención antes de subir:** barrido de secretos en el árbol de trabajo (**0 coincidencias** de credenciales/tokens) y `.gitignore` ampliado con `web/.relay.pid` (runtime del relé, no debe versionarse).
- **Commit `05ba55a`** — *feat(web): auditoría en vivo con DevTools y 7 tareas del Aprendiz autoverificadas*: **13 archivos, 2.146 inserciones** (`web/` completo, agentes con la herramienta `node --check`, `AGENTS.md`, `opencode.json`, `PLAN-WEB-CIRCO.md`, `MEMORY.md`, `borradores/`). **Árbol limpio.**
- **Notas del Director:**
  - _Historial: `bf2112e` (arquitectura inicial) → `05ba55a` (la carpa en vivo). Pte. subir a GitHub cuando el público cree el repo (el README aún lleva `<tu-usuario>` como placeholder)._

---

## 📝 Notas y Preferencias del Público (Contexto Persistente)

- **Herramienta concedida al Aprendiz (8-oct-2026):** shell **acotado** a `node --check *` en `.opencode/agents/aprendiz.md`. Verificación **obligatoria** en toda tarea que toque un `.js`, con la salida pegada en el veredicto. Motivo: antes su "verificación por relectura" recaía entera en el Director (su mayor gasto de tokens).
- **Método de trabajo consolidado:** tarea → despacho al Aprendiz (`#sin-pensar`) → **puerta de verificación del Director** (`node --check` + pruebas sintéticas/reales en el navegador vía DevTools) → bitácora.
