import { useState } from "react";
import styles from "./App.module.css";
import { FormGraph } from "./components/FormGraph";
import { PrefillPanel } from "./components/PrefillPanel";
import { dataSources } from "./domain/dataSources/registry";
import { useBlueprintGraph } from "./hooks/useBlueprintGraph";
import { usePrefillMappings } from "./hooks/usePrefillMappings";

export function App() {
  const graphState = useBlueprintGraph();
  const { mappings, setMapping, clearMapping } = usePrefillMappings();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const graph = graphState.status === "ready" ? graphState.graph : null;
  const selectedNode = graph?.nodes.find((node) => node.id === selectedNodeId);

  return (
    <main className={styles.layout}>
      <h1 className={styles.title}>Journey Builder</h1>
      {graphState.status === "loading" && <p className={styles.hint}>Loading forms…</p>}
      {graphState.status === "error" && (
        <p role="alert" className={styles.error}>
          {graphState.message}
        </p>
      )}
      {graph && (
        <>
          <FormGraph
            graph={graph}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
          {selectedNode ? (
            <PrefillPanel
              // A new form gets a fresh panel: an open modal must not carry over to it.
              key={selectedNode.id}
              graph={graph}
              node={selectedNode}
              mappings={mappings[selectedNode.id] ?? {}}
              sources={dataSources}
              onSet={(field, mapping) => setMapping(selectedNode.id, field, mapping)}
              onClear={(field) => clearMapping(selectedNode.id, field)}
            />
          ) : (
            <p className={styles.hint}>Select a form to configure its prefill.</p>
          )}
        </>
      )}
    </main>
  );
}
