import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrefillFieldRow } from "./PrefillFieldRow";

const mapping = { sourceId: "direct", optionKey: "a:email", label: "Form A.email" };

describe("PrefillFieldRow", () => {
  it("opens source selection when nothing is mapped", async () => {
    const onOpen = vi.fn();
    render(<PrefillFieldRow field="email" onOpen={onOpen} onClear={() => {}} />);
    expect(screen.queryByRole("button", { name: "Clear email" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "email" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("shows the mapping and clears it", async () => {
    const onClear = vi.fn();
    render(
      <PrefillFieldRow
        field="email"
        mapping={mapping}
        onOpen={() => {}}
        onClear={onClear}
      />,
    );
    expect(screen.getByText("email: Form A.email")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear email" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
