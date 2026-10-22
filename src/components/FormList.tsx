import type { GraphNode } from "../api/types";

export interface FormListProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

export function FormList({ nodes, selectedNodeId, onSelect }: FormListProps) {
  // The payload lists nodes in no meaningful order; by name reads naturally ("Form A"…).
  const sortedNodes = [...nodes].sort((a, b) => a.data.name.localeCompare(b.data.name));

  return (
    <nav aria-label="Forms">
      <ul>
        {sortedNodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              aria-pressed={node.id === selectedNodeId}
              onClick={() => onSelect(node.id)}
            >
              {node.data.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
