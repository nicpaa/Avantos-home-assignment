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

  it("highlights the selected form's direct and transitive dependencies", () => {
    render(
      <FormGraph
        graph={blueprintGraph}
        selectedNodeId={NODE_IDS.FORM_D}
        onSelect={() => {}}
      />,
    );
    // D depends on B directly and on A through B; C, E and F are unrelated.
    const formB = screen.getByRole("button", { name: "Form B" });
    const formA = screen.getByRole("button", { name: "Form A" });
    expect(formB).toHaveAttribute("data-relation", "direct");
    expect(formB).toHaveAccessibleDescription("Direct dependency");
    expect(formA).toHaveAttribute("data-relation", "transitive");
    expect(formA).toHaveAccessibleDescription("Transitive dependency");
    expect(screen.getByRole("button", { name: "Form C" })).not.toHaveAttribute(
      "data-relation",
    );
  });

  it("highlights only the arrows on the selected form's upstream paths", () => {
    const { container } = render(
      <FormGraph
        graph={blueprintGraph}
        selectedNodeId={NODE_IDS.FORM_D}
        onSelect={() => {}}
      />,
    );
    // A → B and B → D; not A → C, C → E or the arrows into F.
    expect(container.querySelectorAll("path[data-active]")).toHaveLength(2);
  });

  it("shows the legend only while a form is selected", () => {
    const { rerender } = render(
      <FormGraph graph={blueprintGraph} selectedNodeId={null} onSelect={() => {}} />,
    );
    expect(screen.queryByRole("list", { name: "Legend" })).toBeNull();

    rerender(
      <FormGraph
        graph={blueprintGraph}
        selectedNodeId={NODE_IDS.FORM_F}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
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
