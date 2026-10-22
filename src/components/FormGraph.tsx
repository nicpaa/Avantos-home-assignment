import type { BlueprintGraph } from "../api/types";
import { layoutGraph, NODE_HEIGHT, NODE_WIDTH } from "../domain/graph/layout";
import styles from "./FormGraph.module.css";

export interface FormGraphProps {
  graph: BlueprintGraph;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

// The app renders one graph, so a fixed id for the arrowhead marker is enough.
const ARROW_ID = "form-graph-arrow";

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
          </defs>
          {layout.edges.map((edge) => (
            <path
              key={edge.id}
              d={edge.path}
              className={styles.edge}
              markerEnd={`url(#${ARROW_ID})`}
            />
          ))}
        </svg>
        <ul className={styles.nodes}>
          {nodes.map(({ node, x, y }) => (
            <li
              key={node.id}
              className={styles.nodeItem}
              style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
            >
              <button
                type="button"
                className={styles.node}
                aria-pressed={node.id === selectedNodeId}
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
          ))}
        </ul>
      </div>
    </nav>
  );
}
