import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { blueprintGraph, NODE_IDS } from "../test/fixtures/graph";
import { FormList } from "./FormList";

describe("FormList", () => {
  it("lists every form by name, sorted", () => {
    render(
      <FormList nodes={blueprintGraph.nodes} selectedNodeId={null} onSelect={() => {}} />,
    );
    const names = screen.getAllByRole("button").map((button) => button.textContent);
    expect(names).toEqual(["Form A", "Form B", "Form C", "Form D", "Form E", "Form F"]);
  });

  it("marks the selected form as pressed", () => {
    render(
      <FormList
        nodes={blueprintGraph.nodes}
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
      <FormList nodes={blueprintGraph.nodes} selectedNodeId={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Form B" }));
    expect(onSelect).toHaveBeenCalledWith(NODE_IDS.FORM_B);
  });
});
