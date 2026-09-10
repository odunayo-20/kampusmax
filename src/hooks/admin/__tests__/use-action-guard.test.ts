import { describe, expect, it } from "vitest";
import { createActionGuard } from "../use-action-guard";

describe("useActionGuard core (Module 52)", () => {
  it("runs an exclusive action once and returns its result", async () => {
    const guard = createActionGuard();
    const result = await guard.runExclusive("a", async () => "done");
    expect(result).toBe("done");
  });

  it("de-duplicates a concurrent call on the same key", async () => {
    const guard = createActionGuard();
    let resolveFirst: (v: string) => void = () => {};
    const first = guard.runExclusive(
      "same",
      () =>
        new Promise<string>((resolve) => {
          resolveFirst = resolve;
        })
    );
    const second = await guard.runExclusive("same", async () => "duplicate");
    expect(second).toBeNull();
    resolveFirst("first done");
    expect(await first).toBe("first done");
  });

  it("releases the key after the action settles", async () => {
    const guard = createActionGuard();
    await guard.runExclusive("again", async () => {
      expect(guard.isInflight("again")).toBe(true);
    });
    expect(guard.isInflight("again")).toBe(false);
    expect(await guard.runExclusive("again", async () => "ok")).toBe("ok");
  });

  it("releases the key even when the action throws", async () => {
    const guard = createActionGuard();
    await expect(
      guard.runExclusive("boom", async () => {
        throw new Error("fail");
      })
    ).rejects.toThrow("fail");
    expect(guard.isInflight("boom")).toBe(false);
    expect(await guard.runExclusive("boom", async () => "retry ok")).toBe(
      "retry ok"
    );
  });

  it("treats different keys as independent", async () => {
    const guard = createActionGuard();
    const calls: string[] = [];
    await Promise.all([
      guard.runExclusive("x", async () => {
        calls.push("x");
      }),
      guard.runExclusive("y", async () => {
        calls.push("y");
      }),
    ]);
    expect(calls.sort()).toEqual(["x", "y"]);
  });
});