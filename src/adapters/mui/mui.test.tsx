import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "./Alert";
import { ConfirmDialog } from "./Confirm";
import { PromptDialog } from "./Prompt";

describe("mui AlertDialog", () => {
  it("renders title and content and resolves on OK", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <AlertDialog
        title="Heads up"
        content="something happened"
        resolve={resolve}
        reject={vi.fn()}
      />,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("something happened")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(resolve).toHaveBeenCalledWith();
  });
});

describe("mui ConfirmDialog", () => {
  it("resolves true on OK and false on Cancel", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    const { rerender } = render(
      <ConfirmDialog
        title="Confirm"
        content="are you sure?"
        resolve={resolve}
        reject={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(resolve).toHaveBeenLastCalledWith(true);

    const resolve2 = vi.fn();
    rerender(
      <ConfirmDialog
        title="Confirm"
        content="are you sure?"
        resolve={resolve2}
        reject={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(resolve2).toHaveBeenLastCalledWith(false);
  });
});

describe("mui PromptDialog", () => {
  it("uses initial value, accepts edits, resolves with the draft on OK", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <PromptDialog
        title="Name"
        content="enter name"
        value="alice"
        resolve={resolve}
        reject={vi.fn()}
      />,
    );
    const input = screen.getByDisplayValue("alice") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "bob");
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(resolve).toHaveBeenCalledWith("bob");
  });

  it("resolves undefined on Cancel", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <PromptDialog
        title="Name"
        content="enter name"
        value="alice"
        resolve={resolve}
        reject={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(resolve).toHaveBeenCalledWith(undefined);
  });
});
