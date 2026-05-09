import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "./Alert";
import { ConfirmDialog } from "./Confirm";
import { PromptDialog } from "./Prompt";

describe("native AlertDialog", () => {
  it("renders content and resolves when OK is clicked", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <AlertDialog
        content="alert body"
        resolve={resolve}
        reject={vi.fn()}
      />,
    );
    expect(screen.getByText("alert body")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(resolve).toHaveBeenCalledWith();
  });
});

describe("native ConfirmDialog", () => {
  it("resolves true on OK and false on Cancel", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    const { rerender } = render(
      <ConfirmDialog content="confirm body" resolve={resolve} reject={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(resolve).toHaveBeenLastCalledWith(true);

    const resolve2 = vi.fn();
    rerender(
      <ConfirmDialog content="confirm body" resolve={resolve2} reject={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(resolve2).toHaveBeenLastCalledWith(false);
  });
});

describe("native PromptDialog", () => {
  it("uses initial value, accepts edits, resolves with the draft on OK", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <PromptDialog
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

  it("resolves undefined on Cancel regardless of edits", async () => {
    const user = userEvent.setup();
    const resolve = vi.fn();
    render(
      <PromptDialog
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
