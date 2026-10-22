import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { dataSources } from "../domain/dataSources/registry";
import type { DataSource } from "../domain/dataSources/types";
import { blueprintGraph, NODE_IDS } from "../test/fixtures/graph";
import { DataSourceModal, type DataSourceModalProps } from "./DataSourceModal";

function renderModal(props: Partial<DataSourceModalProps> = {}) {
  render(
    <DataSourceModal
      sources={dataSources}
      context={{ graph: blueprintGraph, targetNodeId: NODE_IDS.FORM_D }}
      onSelect={() => {}}
      onClose={() => {}}
      {...props}
    />,
  );
}

function groupLabels(sourceLabel: string) {
  const section = screen.getByRole("region", { name: sourceLabel });
  return within(section)
    .getAllByRole("group")
    .map((group) => group.getAttribute("aria-label"));
}

describe("DataSourceModal", () => {
  it("is an accessible modal dialog", () => {
    renderModal();
    const dialog = screen.getByRole("dialog", { name: "Select data element to map" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("shows the groups of every registered source", () => {
    renderModal();
    expect(groupLabels("Direct dependencies")).toEqual(["Form B"]);
    expect(groupLabels("Transitive dependencies")).toEqual(["Form A"]);
    expect(groupLabels("Global data")).toEqual([
      "Action Properties",
      "Client Organisation Properties",
    ]);
  });

  it("renders a new source without any other change", () => {
    const tenantSource: DataSource = {
      id: "tenant",
      label: "Tenant settings",
      getOptions: () => [
        {
          id: "tenant",
          label: "Tenant",
          options: [{ key: "tenant:locale", label: "locale" }],
        },
      ],
    };
    renderModal({ sources: [...dataSources, tenantSource] });
    expect(groupLabels("Tenant settings")).toEqual(["Tenant"]);
  });

  it("hides sources with no options", () => {
    renderModal({ context: { graph: blueprintGraph, targetNodeId: NODE_IDS.FORM_A } });
    expect(screen.queryByRole("region", { name: "Direct dependencies" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Transitive dependencies" })).toBeNull();
    expect(screen.getByRole("region", { name: "Global data" })).toBeInTheDocument();
  });

  it("explains when no source has anything to offer", () => {
    renderModal({ sources: [] });
    expect(screen.getByText("No data available to prefill from.")).toBeInTheDocument();
  });

  it("emits a mapping for the picked option", async () => {
    const onSelect = vi.fn();
    renderModal({ onSelect });

    const formA = screen.getByRole("group", { name: "Form A" });
    await userEvent.click(within(formA).getByRole("button", { name: "email" }));

    expect(onSelect).toHaveBeenCalledWith({
      sourceId: "transitive-dependencies",
      optionKey: `${NODE_IDS.FORM_A}:email`,
      label: "Form A.email",
    });
  });

  it("closes via Cancel, the backdrop and Escape", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    // The backdrop is the dialog's parent; clicks inside the dialog don't close it.
    await userEvent.click(
      screen.getByRole("heading", { name: "Select data element to map" }),
    );
    const backdrop = screen.getByRole("dialog").parentElement;
    if (backdrop) await userEvent.click(backdrop);
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
