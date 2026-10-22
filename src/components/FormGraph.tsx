import type { BlueprintGraph } from "../api/types";
import { layoutGraph, NODE_HEIGHT, NODE_WIDTH } from "../domain/graph/layout";
import {
  getDirectDependencyIds,
  getTransitiveDependencyIds,
} from "../domain/graph/traversal";
import styles from "./FormGraph.module.css";

export interface FormGraphProps {
  graph: BlueprintGraph;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

type Relation = "direct" | "transitive";

// The app renders one graph, so fixed ids (arrowheads, legend) are enough.
const ARROW_ID = "form-graph-arrow";
const ACTIVE_ARROW_ID = "form-graph-arrow-active";
const LEGEND_IDS: Record<Relation, string> = {
  direct: "form-graph-legend-direct",
  transitive: "form-graph-legend-transitive",
};

// A static element, not a component: one component per file.
const formIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M2 6h12M6 6v8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function FormGraph({ graph, selectedNodeId, onSelect }: FormGraphProps) {
  const layout = layoutGraph(graph);
  // Tab order follows the names (A, B, C…); the payload order is arbitrary.
  const nodes = [...layout.nodes].sort((a, b) =>
    a.node.data.name.localeCompare(b.node.data.name),
  );

  // The selected form's upstream forms: the same sets the prefill sources offer.
  const direct = new Set(
    selectedNodeId ? getDirectDependencyIds(graph, selectedNodeId) : [],
  );
  const transitive = new Set(
    selectedNodeId ? getTransitiveDependencyIds(graph, selectedNodeId) : [],
  );
  function relationOf(nodeId: string): Relation | undefined {
    if (direct.has(nodeId)) return "direct";
    if (transitive.has(nodeId)) return "transitive";
    return undefined;
  }
  // An edge lies on the selected form's upstream paths when it ends at that form or at
  // one of its ancestors (the parent of an ancestor is an ancestor too).
  function isActive(target: string): boolean {
    return target === selectedNodeId || relationOf(target) !== undefined;
  }

  return (
    <nav aria-label="Forms" className={styles.scroller}>
      <div
        className={styles.canvas}
        style={{ width: layout.width, height: layout.height }}
      >
        <svg
          className={styles.edges}
          width={layout.width}
          height={layout.height}
          aria-hidden="true"
        >
          <defs>
            <marker
              id={ARROW_ID}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className={styles.arrowHead} />
            </marker>
            <marker
              id={ACTIVE_ARROW_ID}
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className={styles.arrowHeadActive} />
            </marker>
          </defs>
          {layout.edges.map((edge) => {
            const active = isActive(edge.target);
            return (
              <path
                key={edge.id}
                d={edge.path}
                data-active={active || undefined}
                className={active ? styles.edgeActive : styles.edge}
                markerEnd={`url(#${active ? ACTIVE_ARROW_ID : ARROW_ID})`}
              />
            );
          })}
        </svg>
        <ul className={styles.nodes}>
          {nodes.map(({ node, x, y }) => {
            const relation = relationOf(node.id);
            return (
              <li
                key={node.id}
                className={styles.nodeItem}
                style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
              >
                <button
                  type="button"
                  className={styles.node}
                  aria-pressed={node.id === selectedNodeId}
                  data-relation={relation}
                  // The relation is read out from the legend, without changing the name.
                  aria-describedby={relation && LEGEND_IDS[relation]}
                  onClick={() => onSelect(node.id)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {formIcon}
                  </span>
                  <span className={styles.text}>
                    {/* Hidden from the accessible name, so the button reads "Form A". */}
                    <span className={styles.kind} aria-hidden="true">
                      Form
                    </span>
                    <span className={styles.name}>{node.data.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {selectedNodeId && (
        <ul className={styles.legend} aria-label="Legend">
          <li className={styles.legendSelected}>Selected form</li>
          <li id={LEGEND_IDS.direct} className={styles.legendDirect}>
            Direct dependency
          </li>
          <li id={LEGEND_IDS.transitive} className={styles.legendTransitive}>
            Transitive dependency
          </li>
        </ul>
      )}
    </nav>
  );
}
