# `src/lib/dag` — DAG Engine (Sprint 3)

Pure TypeScript coordinate math for the family tree's Relationship-Centric
DAG (Master Spec §1–§2). No React, no `@xyflow/react`, no Supabase client —
every function here is a plain input → output transformation, testable
without a browser or a database. That's deliberate: this module was built
in parallel with Sprint 2 (canvas UI) in a separate git worktree, and
staying framework/DB-agnostic is what made zero-file-overlap parallel work
possible. Keep it that way — if a change here needs to import React Flow
types or a Supabase client, it belongs in the caller, not in this module.

## Modules

| File | Purpose | Spec reference |
|---|---|---|
| `midpoint.ts` | Positions a union node at the midpoint between two partners | Master Spec §2A |
| `generations.ts` | Assigns `generation_index` via the "Lowest Parent" rule | Master Spec §2C |
| `edges.ts` | Solid vs. dashed line styling for child edges | Sprint_Roadmap.md Sprint 3 |
| `layout.ts` | Initial (non-elastic) `canvas_x`/`canvas_y` placement | Sprint_Roadmap.md Sprint 3 |

### `midpoint.ts` — `calculateMidpoint(partner1, partner2)`

Returns `{x, y}` at the arithmetic midpoint of two partner positions. If
one partner's position is unknown (`null`), returns the other partner's
position rather than failing — genealogy data frequently has one unknown
parent, and the `union_nodes` schema already allows a null partner.

### `generations.ts` — `calculateGenerations(input)`

Takes a flat list of person IDs, union nodes (`partner1Id`/`partner2Id`),
and child edges (`unionNodeId` → `childPersonId`), and returns a
`Map<personId, generationIndex>`.

Algorithm: flattens union-node child edges into direct parent→child edges
over persons, then runs a Kahn's-algorithm-style longest-path pass — a
person's generation is only finalized once every parent contribution has
been applied, so `generation[child] = max(generation of all parents) + 1`
holds even when a person has parents from very different generations (the
"Lowest Parent" rule). A person with no parents in the input is generation
`0`.

**Does not write to the database.** `Sprint_Roadmap.md`'s Sprint 3 task
list says to persist `generation_index` to the `persons` table; this
module computes it in memory only. Persistence was deliberately deferred
to wherever a person mutation actually happens (see `docs/CHANGELOG.md`,
Sprint 2 & 3 section) — call `calculateGenerations()` there and write the
result yourself.

**Cycles never crash the engine.** Family tree data should always be
acyclic, but if malformed data contains a cycle, any person whose
generation depends on that cycle is simply left out of the returned map.
Callers should treat a missing entry as "could not be determined," not
assume every input person ID is a key in the result.

### `edges.ts` — `getEdgeStyle(edgeType)`

Maps `edges.edge_type` (`biological | adopted | foster | guardian`) to a
plain `{ strokeDasharray }` descriptor: `biological` is solid
(`strokeDasharray: undefined`), the other three are dashed (`"6 4"`).

Returns a plain object, not a React Flow `Edge` — spread `strokeDasharray`
into an edge's `style` prop at the call site. The switch is exhaustive
over `FamilyEdgeType`, so adding a fifth edge type is a compile error here
until this file is updated.

**Interpretation, not a direct spec quote:** Master Spec §2B documents
solid-vs-dashed explicitly for `union_nodes.relationship_type` (married =
solid, partners = dashed), but never states a visual convention for
`edges.edge_type`. This module applies the same solid/dashed convention to
child edges since that's what the column exists to drive. If this reading
is wrong, the fix is contained to this one file.

### `layout.ts` — `calculateInitialLayout(persons)`

Given `{personId, generationIndex}` pairs (sibling order is caller-
controlled — pass persons in the order they should appear left-to-right),
returns `{personId, x, y}` with `HORIZONTAL_SPACING` (280px) between
siblings in the same generation and `VERTICAL_SPACING` (180px) between
generations.

This is a **starting layout only** — sequential placement with no
overlap/collision awareness. Sprint 4 ("Elastic Layout & Collision
Detection", Master Spec §2C) owns dynamically shifting subtrees when the
tree changes; this module produces the baseline it shifts from. Not
listed as a literal bullet in `Sprint_Roadmap.md`'s Sprint 3 task list —
included because Sprint 3's stated goal is "code the core mathematical
engine and coordinate math," and Sprint 4 needs something to push against.

## Testing

All four modules are covered in `src/tests/unit/dag.test.ts` (22 tests).
Per `Sprint_Roadmap.md`: "these are the most likely source of silent
regressions as the engine grows" — when changing the generation or
midpoint logic, add a test for the new case rather than only relying on
the existing ones still passing.
