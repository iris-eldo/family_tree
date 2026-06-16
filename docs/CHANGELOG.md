# Changelog

All changes to this project are logged here — code, docs, config, schema, and design decisions. Every entry should be small enough to describe in one line.

Format:
`[YYYY-MM-DD] [Sprint X / Pre-Sprint] [Category] — Description`

Categories: `docs` `schema` `auth` `ui` `canvas` `api` `config` `security` `test` `fix`

---

## Pre-Sprint / Project Setup

- [2026-06-16] [Pre-Sprint] [config] — Initialized Next.js 16 + Tailwind + TypeScript project under `family-tree-wiki/`
- [2026-06-16] [Pre-Sprint] [schema] — Created Supabase project; wired anon key and URL to `.env.local`
- [2026-06-16] [Pre-Sprint] [ui] — Built Sprint 1 diagnostic page (`page.tsx`) to verify Supabase `persons` table connection
- [2026-06-16] [Pre-Sprint] [config] — Added `utils/supabase.ts` Supabase client utility
- [2026-06-16] [Pre-Sprint] [docs] — Wrote `Master_Specifications.md` covering full architectural spec for the DAG-based family tree app
- [2026-06-16] [Pre-Sprint] [docs] — Wrote `Sprint_Roadmap.md` covering 14-sprint development roadmap
- [2026-06-16] [Pre-Sprint] [security] — Added Section 8 (Security Architecture) to `Master_Specifications.md`: RLS policy, auth prerequisite, audit field trigger, signed uploads, fusion authorization matrix, threat model table
- [2026-06-16] [Pre-Sprint] [security] — Injected `[SECURITY]` tasks into Sprint 1, 2, 9, and 11 in `Sprint_Roadmap.md`
- [2026-06-16] [Pre-Sprint] [docs] — Created `docs/` folder; moved `Master_Specifications.md` and `Sprint_Roadmap.md` into it
- [2026-06-16] [Pre-Sprint] [docs] — Created this `CHANGELOG.md`

## Sprint 1 — Environment & Production-Ready Data Modeling

- [2026-06-16] [Sprint 1] [config] — Created `supabase/migrations/` folder to version-control all schema changes
- [2026-06-16] [Sprint 1] [schema] — `001_initial_schema.sql`: created `persons`, `union_nodes`, `edges` tables with all columns from Master Spec; enabled `ltree` extension; added `tree_path LTREE` column to `persons` for subtree queries; added GiST index on `tree_path`
- [2026-06-16] [Sprint 1] [security] — `002_rls_policies.sql`: enabled RLS on all three tables; added authenticated-user baseline policies (select/insert/update/delete); added anon-block policies to prevent unauthenticated access entirely
- [2026-06-16] [Sprint 1] [security] — `003_audit_triggers.sql`: created `set_audit_fields()` trigger function using `auth.uid()`; attached to `persons`, `union_nodes`, and `edges` — client-supplied `created_by`/`last_edited_by` values are overwritten server-side
