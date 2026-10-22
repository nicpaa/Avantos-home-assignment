import { useState } from "react";
import styles from "./App.module.css";
import { FormList } from "./components/FormList";
import { useBlueprintGraph } from "./hooks/useBlueprintGraph";

export function App() {
  const graphState = useBlueprintGraph();
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
          <section>
            {selectedNode ? (
              <h2>{selectedNode.data.name}</h2>
            ) : (
              <p>Select a form to configure its prefill.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
