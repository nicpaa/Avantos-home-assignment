import { useState } from "react";
import styles from "./App.module.css";
import { FormList } from "./components/FormList";
import { PrefillPanel } from "./components/PrefillPanel";
import { useBlueprintGraph } from "./hooks/useBlueprintGraph";
import { usePrefillMappings } from "./hooks/usePrefillMappings";

export function App() {
  const graphState = useBlueprintGraph();
  const { mappings, clearMapping } = usePrefillMappings();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const graph = graphState.status === "ready" ? graphState.graph : null;
  const selectedNode = graph?.nodes.find((node) => node.id === selectedNodeId);

  return (
    <main className={styles.layout}>
      <h1>Journey Builder</h1>
      {graphState.status === "loading" && <p>Loading forms…</p>}
      {graphState.status === "error" && <p role="alert">{graphState.message}</p>}
      {graph && (
        <>
          <FormList
            nodes={graph.nodes}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
          {selectedNode ? (
            <PrefillPanel
              graph={graph}
              node={selectedNode}
              mappings={mappings[selectedNode.id] ?? {}}
              onClear={(field) => clearMapping(selectedNode.id, field)}
            />
          ) : (
            <p>Select a form to configure its prefill.</p>
          )}
        </>
      )}
    </main>
  );
}
