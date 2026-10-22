import { render, screen } from "@testing-library/react";
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

  it("shows the error when the graph can't be loaded", async () => {
    server.use(http.get(buildGraphUrl(), () => HttpResponse.error()));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Is the mock server running",
    );
  });
});
