import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GraphNode } from "../api/types";
import { dataSources } from "../domain/dataSources/registry";
import { blueprintGraph, NODE_IDS } from "../test/fixtures/graph";
import { PrefillPanel, type PrefillPanelProps } from "./PrefillPanel";

function getNode(id: string): GraphNode {
  const node = blueprintGraph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Fixture has no node ${id}`);
  return node;
}

function renderPanel(props: Partial<PrefillPanelProps> = {}) {
  render(
    <PrefillPanel
      graph={blueprintGraph}
      node={getNode(NODE_IDS.FORM_D)}
      mappings={{}}
      sources={dataSources}
      onSet={() => {}}
      onClear={() => {}}
      {...props}
    />,
  );
}

const mapping = { sourceId: "direct", optionKey: "b:email", label: "Form B.email" };

describe("PrefillPanel", () => {
  it("lists the prefillable fields of the node's form", () => {
    renderPanel();
    expect(screen.getByRole("heading", { name: "Form D" })).toBeInTheDocument();
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual(["email", "name", "notes"]);
  });

  it("shows mapped fields and clears the clicked one", async () => {
    const onClear = vi.fn();
    renderPanel({ mappings: { email: mapping }, onClear });
    expect(screen.getByText("email: Form B.email")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear email" }));
    expect(onClear).toHaveBeenCalledWith("email");
  });

  it("sets the field picked in the modal and closes it", async () => {
    const onSet = vi.fn();
    renderPanel({ onSet });

    await userEvent.click(screen.getByRole("button", { name: "name" }));
    const formB = within(screen.getByRole("dialog")).getByRole("group", {
      name: "Form B",
    });
    await userEvent.click(within(formB).getByRole("button", { name: "email" }));

    expect(onSet).toHaveBeenCalledWith("name", {
      sourceId: "direct-dependencies",
      optionKey: `${NODE_IDS.FORM_B}:email`,
      label: "Form B.email",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains when the form has nothing to prefill", () => {
    const orphan: GraphNode = {
      id: "orphan",
      position: { x: 0, y: 0 },
      data: { name: "Orphan", component_id: "missing-form", prerequisites: [] },
    };
    renderPanel({ node: orphan });
    expect(screen.getByText("This form has no fields to prefill.")).toBeInTheDocument();
  });
});
