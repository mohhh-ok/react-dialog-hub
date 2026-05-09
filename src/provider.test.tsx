import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DialogProps } from "./types";
import { DialogsProvider } from "./provider";
import { useDialogs } from "./context";

function MyAlert({ content, resolve, reject }: DialogProps<{ content: string }, string, Error>) {
  return (
    <div role="dialog" aria-label={content}>
      <span>{content}</span>
      <button onClick={() => resolve("ok")}>OK</button>
      <button onClick={() => reject(new Error("nope"))}>NG</button>
    </div>
  );
}

function Trigger({ onResult }: { onResult: (v: unknown) => void }) {
  const { show } = useDialogs();
  return (
    <button
      onClick={async () => {
        try {
          const r = await show<{ content: string }, string, Error>(MyAlert, { content: "hello" });
          onResult({ ok: r });
        } catch (e) {
          onResult({ err: (e as Error).message });
        }
      }}
    >
      open
    </button>
  );
}

describe("DialogsProvider", () => {
  it("show() resolves with the value passed by the dialog", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <DialogsProvider>
        <Trigger onResult={onResult} />
      </DialogsProvider>,
    );

    await user.click(screen.getByText("open"));
    expect(await screen.findByText("hello")).toBeInTheDocument();

    await user.click(screen.getByText("OK"));
    expect(onResult).toHaveBeenCalledWith({ ok: "ok" });
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("show() rejects when the dialog calls reject()", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <DialogsProvider>
        <Trigger onResult={onResult} />
      </DialogsProvider>,
    );

    await user.click(screen.getByText("open"));
    await user.click(screen.getByText("NG"));
    expect(onResult).toHaveBeenCalledWith({ err: "nope" });
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
  });

  it("supports stacking multiple dialogs and removes only the resolved one", async () => {
    const user = userEvent.setup();
    function Stacker() {
      const { show } = useDialogs();
      return (
        <>
          <button
            onClick={() => {
              show<{ content: string }, string, Error>(MyAlert, { content: "first" });
              show<{ content: string }, string, Error>(MyAlert, { content: "second" });
            }}
          >
            open both
          </button>
        </>
      );
    }

    render(
      <DialogsProvider>
        <Stacker />
      </DialogsProvider>,
    );

    await user.click(screen.getByText("open both"));
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();

    const okButtons = screen.getAllByText("OK");
    await user.click(okButtons[0]!);

    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("show() can be called without props for dialogs that accept no input", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    function NoPropsDialog({ resolve }: DialogProps<unknown, number>) {
      return <button onClick={() => resolve(42)}>done</button>;
    }
    function T() {
      const { show } = useDialogs();
      return (
        <button onClick={async () => onResult(await show(NoPropsDialog))}>open</button>
      );
    }

    render(
      <DialogsProvider>
        <T />
      </DialogsProvider>,
    );

    await user.click(screen.getByText("open"));
    await user.click(screen.getByText("done"));
    await act(async () => {});
    expect(onResult).toHaveBeenCalledWith(42);
  });
});
