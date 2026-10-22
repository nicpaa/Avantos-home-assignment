# Journey Builder — Prefill Configuration

A React + TypeScript app that fetches a blueprint's form DAG from the Avantos mock server,
draws it as a graph of forms, and lets you configure **prefill** for each form's fields: every field can be
mapped to a value from a pluggable **data source** — fields of directly or transitively
upstream forms, or global data. Mappings can be viewed and cleared per form.

## Prerequisites

- Node.js 20+ (developed on 24.22) and npm

## Running locally

### 1. Mock server

```bash
git clone https://github.com/mosaic-avantos/frontendchallengeserver
cd frontendchallengeserver && npm install && npm start   # http://localhost:3000
```

### 2. App

```bash
npm install
cp .env.example .env   # optional — the defaults already point at localhost:3000
npm run dev            # http://localhost:5173
```

`.env.example` documents `VITE_API_BASE_URL`, `VITE_TENANT_ID` and `VITE_BLUEPRINT_ID`. The mock
server ignores the ids, but they stay configurable so the client works against a real backend.

## Scripts

| Command             | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                       |
| `npm run build`     | Type-check and build for production             |
| `npm run preview`   | Serve the production build                      |
| `npm run typecheck` | `tsc` in strict mode, no output                 |
| `npm run lint`      | ESLint (typescript-eslint + react-hooks)        |
| `npm run format`    | Format with Prettier (`format:check` to verify) |
| `npm test`          | Vitest in watch mode                            |
| `npm run test:run`  | Vitest, single run                              |

## How it works

1. The app loads the graph and draws its forms (Form A … Form F) at the positions saved by
   the Avantos editor, with an arrow from each form to the forms that depend on it.
2. Selecting a form shows its prefillable fields.
   - A mapped field reads `email: Form A.email` and has a **×** button to clear it.
   - An empty field is a button that opens the source-selection modal.
3. The modal groups the options by data source:
   - **Direct dependencies** — fields of the forms this form directly depends on,
   - **Transitive dependencies** — fields of forms further upstream,
   - **Global data** — action and client organisation properties.
4. Picking an option stores the mapping for that form's field.

For the blueprint's DAG (A → B, C; B → D; C → E; D, E → F), Form D offers Form B (direct),
Form A (transitive) and global data; Form A, a root, only offers global data.

## Architecture

```
src/
  api/                  fetch client, response types, type guard (no React)
  domain/
    graph/              pure DAG traversal, form/field lookup, graph layout
    prefill/            PrefillMapping types + pure reducer
    dataSources/        DataSource interface, the three sources, registry
  hooks/                useBlueprintGraph (fetch + abort), usePrefillMappings (useReducer)
  components/           FormGraph, PrefillPanel, PrefillFieldRow, DataSourceModal
  test/                 Vitest setup, MSW server, shared fixture graph
  App.tsx               wiring only
```

Dependencies point one way: `components → hooks → domain → api`. Everything in `api/` and
`domain/` is plain TypeScript, tested without React.

```
App                       loads graph, owns mappings + selected form
├── FormGraph             one button per form + SVG arrows
└── PrefillPanel          fields of the selected form, which field is being edited
    ├── PrefillFieldRow ×N   mapped (label + ×) or empty (opens modal)
    └── DataSourceModal      renders whatever sources it is given
```

## Adding a new data source

A data source is any object implementing `DataSource` (`src/domain/dataSources/types.ts`):

```ts
interface DataSource {
  id: string; // stored on every mapping created from it
  label: string; // section heading in the modal
  getOptions(context: DataSourceContext): DataSourceGroup[]; // context = { graph, targetNodeId }
}
```

1. Create the source in `src/domain/dataSources/`, e.g. `tenantSettings.ts`:

   ```ts
   import type { DataSource } from "./types";

   /** Settings shared by every form of the tenant. */
   export const tenantSettingsSource: DataSource = {
     id: "tenant-settings",
     label: "Tenant settings",
     getOptions: () => [
       {
         id: "tenant",
         label: "Tenant",
         options: [
           { key: "tenant:locale", label: "locale" },
           { key: "tenant:timezone", label: "timezone" },
         ],
       },
     ],
   };
   ```

2. Register it in `src/domain/dataSources/registry.ts` — the order of the array is the order in
   the modal:

   ```ts
   export const dataSources: readonly DataSource[] = [
     directDependenciesSource,
     transitiveDependenciesSource,
     globalDataSource,
     tenantSettingsSource, // ← new
   ];
   ```

3. Add `tenantSettings.test.ts` next to it for its `getOptions` output.

That's it — no component, hook, reducer or type changes. The modal receives the registry as a
prop and only knows the interface; `DataSourceModal.test.tsx` ("renders a new source without
any other change") proves it by injecting a fake source. Removing or reordering sources is an
edit to the same array.

## Testing

```bash
npm run test:run
```

Tests are co-located (`*.test.ts(x)`) and share one fixture graph,
`src/test/fixtures/graph.ts` — a trimmed copy of the real payload with the same ids and DAG.
Components are queried by role/label/text; the network is mocked with MSW.

- `api/guards.test.ts` — accepts the real shape, extra fields and missing positions, rejects malformed payloads
- `api/client.test.ts` — success, HTTP error, network error (with `cause`), invalid JSON, wrong shape
- `domain/graph/traversal.test.ts` — root, direct vs transitive, diamond (A listed once), unknown id, cycle
- `domain/graph/forms.test.ts` — node → shared form, buttons excluded from fields
- `domain/graph/layout.test.ts` — offsets and size of the drawing, one edge per prerequisite, edge path, depth layout when positions are missing
- `domain/prefill/prefillReducer.test.ts` — set, overwrite, clear, no-op clear, node isolation, immutability
- `domain/dataSources/*.test.ts` — each source's groups for D, F and root A; registry order and unique ids
- `hooks/useBlueprintGraph.test.ts` — loading → ready, error, request aborted on unmount
- `hooks/usePrefillMappings.test.ts` — set and clear through the hook
- `components/FormGraph.test.tsx` — a button per form in name order, accessible names, arrows, selected state, selection callback
- `components/PrefillFieldRow.test.tsx` — empty row opens the modal, mapped row clears
- `components/PrefillPanel.test.tsx` — fields of the form, clear, pick from modal, empty form
- `components/DataSourceModal.test.tsx` — a11y, groups per source, injected source, hidden empty sources, select, close (Cancel/backdrop/Escape)
- `App.test.tsx` — the full flow: load, map, mappings kept per form, clear, switching forms closes the modal, error state

## Design decisions & trade-offs

- **`prerequisites` is the graph's source of truth, not `edges`.** Both describe the same DAG;
  `prerequisites` sits on each node, so traversal walks node → parents without building an
  adjacency map from the edge list.
- **Transitive dependencies exclude direct ones.** Every upstream form appears once in the modal,
  under its closest relationship (otherwise B would show up twice for D). Order is breadth-first,
  nearest first; a `visited` set de-duplicates diamonds and guards against malformed cycles.
- **Mappings are keyed by node id, not form id.** Forms A, D, E and F share one form definition;
  keying by form would make a mapping on D appear on A, E and F too.
- **Sources are injected as props; the registry is configuration.** Components never import a
  concrete source, so sources can be added, removed or swapped (e.g. in tests) without touching UI code.
- **`useReducer` instead of a state library.** The state is one map with two actions; a pure
  reducer is trivial to test and needs no dependency. No context either — props go at most two
  levels deep.
- **`unknown` + type guard at the API boundary.** The response is validated before the app uses
  it, so a backend change fails loudly with a clear message instead of as `undefined` deep in the
  UI. The guard checks only the fields the app reads; extra fields are ignored.
- **Buttons are not prefillable.** `avantos_type: "button"` is an action, not data, so it is
  neither a target nor a source.
- **Field keys are the labels** (`email`, `dynamic_checkbox_group`). Some fields have
  `title: null`, so keys are the only label that always exists.
- **Global data is static.** The payload contains none, so `globalData.ts` defines stand-in
  groups behind the same interface a real API-backed source would use.
- **State is in memory.** Mappings are not persisted, and `node.data.input_mapping` (always `{}`
  in the mock, format undocumented) is ignored rather than guessed at.
- **One-click selection.** Picking an option maps it immediately and closes the modal.
- **The graph is drawn by hand, not with React Flow.** Nodes use the `position` saved in the
  payload; `layoutGraph` (pure, tested) shifts them into view and computes the arrows from
  `prerequisites`. Forms stay real `<button>`s over a decorative SVG, so keyboard and screen
  readers work as with a list. A library would add zoom/pan/drag, which this view doesn't need.
- **`position` is optional.** Only the drawing needs it, so a payload without positions still
  loads: `layoutGraph` then places forms in columns by depth (longest path from a root).
- **Switching forms resets the panel** (`key={selectedNode.id}`), so an open modal never
  carries over to another form — the modal has no focus trap yet, so the graph behind it is
  still reachable by keyboard.
- **Styling** is plain CSS modules over a few design tokens in `src/index.css`.

## What I'd improve with more time

- Persist mappings — e.g. write them to `input_mapping` once its format is known.
- Type compatibility: only offer source fields whose type matches the target field.
- Modal UX: search/filter, and a full focus trap with focus return to the field (today focus
  only moves into the dialog on open), keyboard navigation between options.
- Show the current mapping in the modal and allow replacing it without clearing first.
- An end-to-end test (Playwright) against the real mock server.
