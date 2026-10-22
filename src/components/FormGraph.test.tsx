import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { blueprintGraph, NODE_IDS } from "../test/fixtures/graph";
import { FormGraph } from "./FormGraph";

describe("FormGraph", () => {
  it("shows every form as a button, in name order", () => {
    render(
      <FormGraph graph={blueprintGraph} selectedNodeId={null} onSelect={() => {}} />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(6);
    const names = screen.getAllByText(/^Form [A-F]$/).map((name) => name.textContent);
    expect(names).toEqual(["Form A", "Form B", "Form C", "Form D", "Form E", "Form F"]);
  });

  it("names each button after its form only", () => {
    render(
      <FormGraph graph={blueprintGraph} selectedNodeId={null} onSelect={() => {}} />,
    );
    // The small "Form" caption is aria-hidden, so it doesn't repeat in the name.
    expect(screen.getByRole("button", { name: "Form A" })).toBeInTheDocument();
  });

  it("draws an arrow for every dependency", () => {
    const { container } = render(
      <FormGraph graph={blueprintGraph} selectedNodeId={null} onSelect={() => {}} />,
    );
    // The arrows are decorative (aria-hidden), so there is no role to query.
    expect(container.querySelectorAll("svg[aria-hidden] > path")).toHaveLength(6);
  });

  it("marks the selected form as pressed", () => {
    render(
      <FormGraph
        graph={blueprintGraph}
        selectedNodeId={NODE_IDS.FORM_D}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Form D" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Form A" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the clicked node id", async () => {
    const onSelect = vi.fn();
    render(
      <FormGraph graph={blueprintGraph} selectedNodeId={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Form B" }));
    expect(onSelect).toHaveBeenCalledWith(NODE_IDS.FORM_B);
  });
});
