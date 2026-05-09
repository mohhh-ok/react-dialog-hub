import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDialogs } from "./context";
import { DialogsProvider } from "./provider";

describe("useDialogs", () => {
  it("throws when used outside DialogsProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useDialogs())).toThrow(
      /must be used within DialogProvider/,
    );
    spy.mockRestore();
  });

  it("returns a context value with show() inside DialogsProvider", () => {
    const { result } = renderHook(() => useDialogs(), {
      wrapper: ({ children }) => <DialogsProvider>{children}</DialogsProvider>,
    });
    expect(typeof result.current.show).toBe("function");
  });
});
