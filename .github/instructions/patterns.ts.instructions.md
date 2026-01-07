---
description: "Dependency composition patterns and best practices for serverless Node.js / TypeScript applications."
applyTo: "**/*.ts"
---

# Copilot Instructions for AI Coding Agents (Refined)

## Project Overview

This project is a **serverless Node.js / TypeScript** application designed for AWS Lambda deployment, with seamless local development. The main Express app lives in `app/app.ts`; Lambda and local entry points are in `bin/`.

## Architecture & Major Components

| Layer                | Location                        | Purpose                                         |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| **Transport (HTTP)** | `app/*.ts`                      | Application business rules                      |
| **Composition Root** | `bin/lambda.ts`, `bin/local.ts` | Wires dependencies together and starts the app. |

Key sub‑modules:

- **Express App** — HTTP concerns only.
- **Background Worker** — `app/workerSendToNiva.ts` (same layering rules apply).
- **Views / SSR** — EJS templates in `views/`.
- **Docs** — live in `docs/`.
- **Test Files** — example PDFs in `test_files/`.

## Dependency Composition (Guidelines Inspired by Martin Fowler)

> _“By choosing to fulfill dependency contracts with functions rather than classes … I can create a system composed of highly discrete, evolvable, but still type‑safe modules.”_ — Daniel Somerfield, **Dependency Composition**

1. **Prefer functions over classes.** Each module exports factory functions such as `createFoo(deps) → (args) => result`.
2. **Inject context via partial application.** Pass a single `Dependencies` object to the factory; return a closure that does the real work.
3. **Keep types private by default.** Only export a type when it is truly part of the public contract to avoid incidental coupling.
4. **No DI frameworks.** Manual wiring in the composition root (Lambda & local bootstrap) keeps dependencies explicit and testable.
5. **TDD drives contracts.** Define the minimal `Dependencies` interface in your tests first; production code then implements it.
6. **Layer boundaries**: Controllers → domain factories → repositories/utilities (lowest, no further deps).
7. **Testing strategy**: unit (stub functions), integration (compose real lower layers), E2E (full stack with Testcontainers).

### Example Skeleton

```ts
// app/handlers.ts
export interface HandlerDeps {
  getTopRestaurants(city: string): Promise<Restaurant[]>;
}

export const createTopRatedHandler = (deps: HandlerDeps) => {
  return async (req: Request, res: Response) => {
    const restaurants = await deps.getTopRestaurants(req.params.city);
    res.status(200).json({ restaurants });
  };
};

// app/services/topRated.ts
interface TopRatedDeps {
  findRatingsByRestaurant(city: string): Promise<RatingsByRestaurant[]>;
  calculateRating(ratings: RatingsByRestaurant): number;
}

export const createTopRated = (deps: TopRatedDeps) => {
  return async (city: string) => {
    const ratings = await deps.findRatingsByRestaurant(city);
    // ...business logic...
  };
};
```

## Developer Workflows

- **Node.js v22+** required for native TypeScript execution.
  - Native TS: `node --experimental-strip-types bin/local.ts`
  - ts-node: `ts-node bin/local.ts`
- **Lambda Handler**: exported as `handler` in `bin/lambda.ts`.
- **Env Vars**: managed via `.env`.
- **Tests**: Jest + ts-jest + Testcontainers.

## Project Conventions

- **Explicit Imports**: always include the `.ts` extension.
- **JSDoc**: required on public API surfaces.
- **Separation of Concerns**: transport, domain, integration, composition root.
- **Inline comments** only for non-obvious logic.
- **Dependency Composition Pattern** is mandatory.
  - Factories named `createX` / `initX`.
  - Factory param named `deps` / `dependencies` typed locally.
  - Export a ready-to-use default handler alongside factories for tests.
- **Frontend Styling**: Tailwind utility classes only. No embedded custom CSS blocks, no external UI frameworks. (Utility-driven composition inside templates.)
- **Design language (refined)**: Mobile-first, Apple-inspired clarity and calm, implemented using only Tailwind utilities while structurally borrowing from shadcn/ui component patterns (layout, states, density). Principles:
  1. Hierarchy: one clear primary action per view; secondary actions visually lighter (reduced chroma / subtle borders).
  2. Density & Spaciousness: generous internal padding; avoid margin utilities (except `m-auto`)—structure with flex/grid + padding + gap.
  3. Typography: Prefer a single sans family; establish scale (e.g. text-xs, sm, base, lg, 2xl, 4xl) with consistent leading; headings tight (`tracking-tight`), body normal.
  4. Color: Neutral grayscale foundation; semantic accent (blue) for primary actions; status colors subdued (50/100 backgrounds + 600/700 text) for legibility.
  5. Motion & Feedback: Subtle transitions (`transition`, `duration-150`, `ease-out`); active states slight scale/opacity shifts; focus rings always visible (`focus:ring-2`).
  6. Components: Compose from utility primitives patterned after shadcn (button, card, badge, table row, form field). No copied CSS—express variants inline (conditional class strings or simple helpers) not global class definitions.
  7. States: Hover ≠ focus; ensure distinct focus-visible style. Disabled = reduced opacity + cursor-not-allowed.
  8. Responsiveness: Start from narrow view; use `sm:`, `md:` only to expand layout (never hide critical actions on mobile).
  9. Spacing Scale: Stick to Tailwind spacing units; internal component padding preferably symmetric (e.g. `px-4 py-2.5`).
  10. Accessibility: Minimum 4.5:1 contrast for text; interactive targets ≥ 40px tap area; ARIA labels or `title` where icons alone appear.
  11. Consistency: Variant decisions (primary, secondary, subtle, destructive) applied identically across all components; do not re-invent per view.
  12. Simplicity: Prefer omission over ornament—avoid drop shadows beyond one subtle elevation (`shadow-sm`/`shadow`) unless emphasizing a modal.
- **Spacing rule**: Avoid margin utilities (`m-*`, `mt-*`, `mb-*`, etc.) except `m-auto`; use padding, gap, and layout containers for structure.
- **Layout preference**: Use flex / grid; avoid floats or negative spacing hacks.
- **Commenting & Readability**: Use concise EJS comments for main visual blocks; blank lines between sections.

## Integration Points

- **serverless-http** adapts Express for Lambda.
- **dotenv** loads env vars.
- **EJS** server-side templates.

## Examples

- **Lambda Handler**: see `bin/lambda.ts`.
- **Local Server**: see `bin/local.ts`.
- **Route Handlers**: see `app/handlers.ts`.

## Additional Notes

- Update docs when adding factories/handlers.
- Duplicate small DTOs instead of over-sharing types.
- Shared types (only when necessary) live in context-named modules, not a generic `types.ts`.
- Composition root chooses concrete implementations.
- Keep wrappers minimal; no service locator.
- Prefer Node.js v22; earlier versions require `ts-node`.

---

These refinements embody the principles from Martin Fowler’s _Dependency Composition_ article and promote a clean, evolvable codebase.
