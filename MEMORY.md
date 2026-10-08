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

## 📝 Notas y Preferencias del Público (Contexto Persistente)

- _Aún no hay notas registradas. El Director añadirá observaciones a medida que el público (usuario) dé instrucciones._
