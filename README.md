# Journey Builder — Prefill Configuration

A React + TypeScript app that fetches a blueprint's form DAG from the Avantos mock server,
draws it as a graph of forms, and lets you configure **prefill** for each form's fields:
every field can be mapped to a value from a pluggable **data source** — fields of directly or
transitively upstream forms, or global data. Mappings can be viewed, set and cleared per form.

## Prerequisites

- Node.js 22.12+ (required by Vitest 5 and MSW 3; developed on 24.22) and npm

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

`.env.example` documents `VITE_API_BASE_URL`, `VITE_TENANT_ID` and `VITE_BLUEPRINT_ID` (the
mock server ignores the ids, but they stay configurable so the client works against a real
backend), and `VITE_DATA_SOURCES`, which picks the prefill sources (see below).

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
2. Selecting a form highlights where its prefill data can come from: direct dependencies in
   green, transitive ones in dashed amber, and the arrows leading to the form (with a legend).
   Below the graph it shows the form's prefillable fields.
   - A mapped field reads `email: Form A.email` and has a **×** button to clear it.
   - An empty field is a button that opens the source-selection modal.
3. The modal groups the options by data source:
   - **Direct dependencies** — fields of the forms this form directly depends on,
   - **Transitive dependencies** — fields of forms further upstream,
   - **Global data** — action and client organisation properties.

   A search box (focused when the modal opens) narrows the list: typing `email` keeps the
   email fields of every group, typing `form a` keeps all of Form A's fields.

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
    dataSources/        DataSource interface, the three sources, registry (catalog + selection), search
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

2. Add it to the catalog in `src/domain/dataSources/registry.ts` — the order of the array is
   the default order in the modal:

   ```ts
   export const availableDataSources: readonly DataSource[] = [
     directDependenciesSource,
     transitiveDependenciesSource,
     globalDataSource,
     tenantSettingsSource, // ← new
   ];
   ```

3. Add `tenantSettings.test.ts` next to it for its `getOptions` output.

That's it — no component, hook, reducer or type changes, and the new id can be used in
`VITE_DATA_SOURCES` right away. The modal receives its sources as a prop and only knows the
interface; `DataSourceModal.test.tsx` ("renders a new source without
any other change") proves it by injecting a fake source.

## Using any combination of sources (no code changes)

The three built-in sources are independent, and the modal renders exactly the list it is
given. Which sources are active, and in what order, is configuration: set `VITE_DATA_SOURCES`
(see `.env.example`) to a comma-separated list of source ids.

```bash
VITE_DATA_SOURCES=global-data,direct-dependencies npm run dev
```

| Id                        | Source                  |
| ------------------------- | ----------------------- |
| `direct-dependencies`     | Direct dependencies     |
| `transitive-dependencies` | Transitive dependencies |
| `global-data`             | Global data             |

Unset or empty means every source. An unknown id stops the app with a message listing the
valid ids, instead of silently showing fewer sources. `registry.ts` keeps the two concerns
apart: `availableDataSources` is the catalog of what exists (code), `selectDataSources` picks
what is used (configuration). A new source added to the catalog is immediately a valid id.
`DataSourceModal.test.tsx` renders all 7 combinations of the built-in sources.

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
- `domain/dataSources/*.test.ts` — each source's groups for D, F and root A; catalog order and unique ids, selection by configured ids (order, unknown id); search by option or group label
- `hooks/useBlueprintGraph.test.ts` — loading → ready, error, request aborted on unmount
- `hooks/usePrefillMappings.test.ts` — set and clear through the hook
- `components/FormGraph.test.tsx` — a button per form in name order, accessible names, arrows, selected state, dependency highlighting and legend, selection callback
- `components/PrefillFieldRow.test.tsx` — empty row opens the modal, mapped row clears
- `components/PrefillPanel.test.tsx` — fields of the form, clear, pick from modal, empty form
- `components/DataSourceModal.test.tsx` — a11y and focus, groups per source, injected source, all 7 source combinations, hidden empty sources, search and no-match message, select, close (Cancel/backdrop/Escape)
- `App.test.tsx` — the full flow: load, map, mappings kept per form, clear, switching forms closes the modal, error state

## Built from scratch: compared to the starter

The optional Claude-generated starter (`journey-builder-claude.zip`) was read for reference, not
used as a base. Both use the same core idea (a data source interface plus a list of active
sources), which is the natural shape for this requirement. What this implementation does
differently, and why:

| Starter                                                                            | This repo                                                                                                         | Why                                                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Direct and transitive dependencies are **one** provider ("Form fields" + a badge)  | **Three independent sources**: direct, transitive, global                                                         | The task asks for _any combination_ of the three; with one merged provider "direct only" isn't possible              |
| Changing the active sources means editing the provider array                       | `VITE_DATA_SOURCES` picks sources and order; all 7 combinations are tested                                        | "...can be easily used **without code changes**"                                                                     |
| Response cast with `as BlueprintGraph`; `queue.shift() as string` in the traversal | Response enters as `unknown` and is checked by a type guard; no casts or `!` anywhere                             | A backend change fails at the boundary with a clear message instead of as `undefined` deep in the UI                 |
| Folders by feature (`graph/`, `prefill/`), React and logic mixed                   | `api/` → `domain/` (pure TS, no React) → `hooks/` → `components/`                                                 | Rules (traversal, reducer, sources, layout, search) are tested as plain functions                                    |
| Mappings in `useState` + `useCallback` setters                                     | Pure `prefillReducer` behind `usePrefillMappings`                                                                 | State transitions are tested on their own (no-op clear keeps the same object, nodes sharing a form stay independent) |
| Tests for a few modules (traversal, providers, mappings hook, modal)               | Tests for every layer: guard, client (MSW), traversal, layout, reducer, each source, hooks, components, full flow | "Does the project have good tests?" — including a test that _proves_ a new source needs no UI change                 |
| Modal can't be closed with Escape; focus stays behind it                           | Escape/backdrop/Cancel close it, focus moves to its search box, switching forms closes it                         | Keyboard and screen-reader users                                                                                     |
| Plain list of forms                                                                | Graph at the editor's saved positions, highlighting the selected form's dependencies                              | Not required; shows _why_ the modal offers the sources it does                                                       |

## Design decisions & trade-offs

- **`prerequisites` is the graph's source of truth, not `edges`.** Both describe the same DAG;
  `prerequisites` sits on each node, so traversal walks node → parents without building an
  adjacency map from the edge list.
- **Transitive dependencies exclude direct ones.** Every upstream form appears once in the modal,
  under its closest relationship (otherwise B would show up twice for D). Order is breadth-first,
  nearest first; a `visited` set de-duplicates diamonds and guards against malformed cycles.
- **Mappings are keyed by node id, not form id.** Forms A, D, E and F share one form definition;
  keying by form would make a mapping on D appear on A, E and F too.
- **Sources are injected as props; which ones are active is configuration.** Components never
  import a concrete source. `registry.ts` is the catalog of what exists; `VITE_DATA_SOURCES`
  picks the combination and order, read once in `App.tsx`, so changing it needs no code change.
- **A wrong source id fails fast.** `selectDataSources` throws with the list of valid ids at
  startup; silently ignoring a typo would hide a source without anyone noticing.
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
- **The graph highlights the selected form's dependencies** with the same traversal functions
  the prefill sources use, so the picture always matches what the modal offers. The relation
  is also exposed to screen readers (`aria-describedby` → legend item), without changing the
  buttons' names.
- **Switching forms resets the panel** (`key={selectedNode.id}`), so an open modal never
  carries over to another form — the modal has no focus trap yet, so the graph behind it is
  still reachable by keyboard.
- **Styling** is plain CSS modules over a few design tokens in `src/index.css`.

## What I'd improve with more time

- Asynchronous sources (e.g. options fetched from an API): a second interface shape
  `loadOptions(context, signal): Promise`, with loading and error states per source in the modal.
- Persist mappings — e.g. write them to `input_mapping` once its format is known.
- Type compatibility: only offer source fields whose type matches the target field.
- Modal UX: a full focus trap with focus return to the field (today focus only moves to the
  search box on open), keyboard navigation between options.
- Show the current mapping in the modal and allow replacing it without clearing first.
- An end-to-end test (Playwright) against the real mock server.
