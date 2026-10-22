import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { App } from "./App";
import { buildGraphUrl } from "./api/client";
import { server } from "./test/server";

describe("App", () => {
  it("loads the forms and shows the selected one", async () => {
    render(<App />);
    expect(screen.getByText("Loading forms…")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "Form D" }));
    expect(screen.getByRole("heading", { name: "Form D" })).toBeInTheDocument();
  });

  it("maps a field from an upstream form, keeps it per node, and clears it", async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Form D" }));

    await userEvent.click(screen.getByRole("button", { name: "email" }));
    const formA = within(screen.getByRole("dialog")).getByRole("group", {
      name: "Form A",
    });
    await userEvent.click(within(formA).getByRole("button", { name: "email" }));
    expect(screen.getByText("email: Form A.email")).toBeInTheDocument();

    // Form E shares D's form but has its own mappings.
    await userEvent.click(screen.getByRole("button", { name: "Form E" }));
    expect(screen.queryByText("email: Form A.email")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Form D" }));
    expect(screen.getByText("email: Form A.email")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear email" }));
    expect(screen.getByRole("button", { name: "email" })).toBeInTheDocument();
  });

  it("shows the error when the graph can't be loaded", async () => {
    server.use(http.get(buildGraphUrl(), () => HttpResponse.error()));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Is the mock server running",
    );
  });
});
