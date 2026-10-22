import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GraphNode } from "../api/types";
import { blueprintGraph, NODE_IDS } from "../test/fixtures/graph";
import { PrefillPanel } from "./PrefillPanel";

function getNode(id: string): GraphNode {
  const node = blueprintGraph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Fixture has no node ${id}`);
  return node;
}

const mapping = { sourceId: "direct", optionKey: "b:email", label: "Form B.email" };

describe("PrefillPanel", () => {
  it("lists the prefillable fields of the node's form", () => {
    render(
      <PrefillPanel
        graph={blueprintGraph}
        node={getNode(NODE_IDS.FORM_D)}
        mappings={{}}
        onClear={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { name: "Form D" })).toBeInTheDocument();
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual(["email", "name", "notes"]);
  });

  it("shows mapped fields and clears the clicked one", async () => {
    const onClear = vi.fn();
    render(
      <PrefillPanel
        graph={blueprintGraph}
        node={getNode(NODE_IDS.FORM_D)}
        mappings={{ email: mapping }}
        onClear={onClear}
      />,
    );
    expect(screen.getByText("email: Form B.email")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear email" }));
    expect(onClear).toHaveBeenCalledWith("email");
  });

  it("explains when the form has nothing to prefill", () => {
    const orphan: GraphNode = {
      id: "orphan",
      data: { name: "Orphan", component_id: "missing-form", prerequisites: [] },
    };
    render(
      <PrefillPanel
        graph={blueprintGraph}
        node={orphan}
        mappings={{}}
        onClear={() => {}}
      />,
    );
    expect(screen.getByText("This form has no fields to prefill.")).toBeInTheDocument();
  });
});
