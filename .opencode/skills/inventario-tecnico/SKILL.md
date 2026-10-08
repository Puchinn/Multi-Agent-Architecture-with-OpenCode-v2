---
name: inventario-tecnico
description: Estructura, reglas y contexto del inventario del Circo Gran Fantasía (Supabase, tabla inventario_items). Usar cuando se consulte, calcule o modifique la utilería, el peso, el stock o la logística del circo.
---

# 📦 Skill: Inventario Técnico del Circo

**Fuente de verdad:** desde el 08/10/2026 el inventario vive en **Supabase Postgres**, tabla `public.inventario_items` (MCP `supabase`). El archivo `inventario.json` de la raíz queda **archivado como legacy / solo lectura**: fotografía histórica del volcado inicial, **no se edita más**.

---

## 🗂️ Estructura de `public.inventario_items`

| Columna | Tipo | Regla |
| :-- | :-- | :-- |
| `id` | `bigint identity` | PK real; nunca se edita ni reutiliza. |
| `codigo` | `text UNIQUE` | Identificador legible `UTL-###` (CHECK `^UTL-[0-9]{3}$`). |
| `nombre` | `text NOT NULL` | Nombre descriptivo del objeto. |
| `categoria` | `text` CHECK | `acrobacia`, `utilería`, `disfraz`, `sonido`, `iluminación`, `carpa`, `seguridad`, `otro`. |
| `cantidad` | `integer` CHECK ≥ 0 | Unidades disponibles. |
| `peso_kg` | `numeric(6,2)` CHECK ≥ 0 | Peso **por unidad**. |
| `estado` | `text` CHECK | `operativo`, `en_reparacion`, `dado_de_baja`. |
| `ubicacion` | `text` | Dónde se guarda. |
| `notas` | `text` | Observaciones libres. |
| `created_at` / `updated_at` | `timestamptz` | Automáticos; `updated_at` lo mantiene el trigger `inventario_items_set_updated_at`. |

Migración de referencia: `20261008170011_create_inventario_items`.

---

## 🔐 Seguridad (RLS)

- **RLS activado y sin políticas públicas**: sólo el rol del servidor (nosotros) lee/escribe. Nadie desde la Data API anon/authenticated.
- No crear políticas `TO anon` sin orden expresa del público.
- Toda la escritura pasa por el MCP `supabase` (`execute_sql`).

## 📏 Reglas de Actualización

1. **Permisos de escritura:** sólo el **Utilero (Don Barnaby)** modifica el inventario (vía MCP `supabase`). Los demás agentes sólo leen. La escritura en `MEMORY.md` sigue siendo exclusiva del Director.
2. **Workflow obligatorio del Utilero:**
   - Consultas/modificaciones puntuales → `execute_sql` directo.
   - Cualquier **DDL** (tablas, columnas, constraints, índices) → cargar antes `supabase` + `supabase-postgres-best-practices`, iterar con `execute_sql` (¡nunca `apply_migration` para iterar!), correr `get_advisors`, y sólo entonces una única `apply_migration` con nombre `snake_case`.
   - Si un enfoque falla 2-3 veces → **parar y replantear** (revisar docs/logs; no repetir en bucle).
3. **Verificación:** todo cambio se confirma con una query de prueba (select de conteo/suma). *Un arreglo sin verificación está incompleto.*
4. **IDs estables:** el `codigo` `UTL-###` nunca se reutiliza; los nuevos toman el siguiente número libre.
5. **Peso total:** `sum(cantidad * peso_kg)` sobre ítems con `estado <> 'dado_de_baja'`.
6. **Bajas:** no se borran filas; se pasan a `estado = 'dado_de_baja'` y `cantidad = 0`.
7. **Traza:** altas, bajas y reparaciones que afecten la función se reportan al Director para `MEMORY.md`.

---

## 💡 Reglas de Aplicación para el Agente

- Responde siempre con el tono de Don Barnaby: veterano, cansado pero meticuloso.
- Al calcular pesos o disponibilidad, muestra el desglose (`cantidad × peso_kg`) y no sólo el total.
- Ante cualquier duda de Supabase (Auth, RLS, Edge Functions, logs...), cargar la skill `supabase` antes de actuar.
