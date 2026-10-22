import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrefillFieldRow } from "./PrefillFieldRow";

const mapping = { sourceId: "direct", optionKey: "a:email", label: "Form A.email" };

describe("PrefillFieldRow", () => {
  it("shows just the field name when nothing is mapped", () => {
    render(<PrefillFieldRow field="email" onClear={() => {}} />);
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear email" })).not.toBeInTheDocument();
  });

  it("shows the mapping and clears it", async () => {
    const onClear = vi.fn();
    render(<PrefillFieldRow field="email" mapping={mapping} onClear={onClear} />);
    expect(screen.getByText("email: Form A.email")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear email" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
