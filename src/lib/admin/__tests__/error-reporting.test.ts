import { afterEach, describe, expect, it, vi } from "vitest";
import { adminErrorMessage } from "../error-reporting";

describe("adminErrorMessage (Module 52)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a generic message that never leaks error detail", () => {
    const thrown = new Error("/internal/object-id/abc threw TypeError");
    expect(adminErrorMessage(thrown)).toBe(
      "This request could not be completed. Please try again."
    );
  });

  it("logs the underlying error for diagnostics only", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("secret detail");
    adminErrorMessage(err);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("[admin] request failed:", err);
  });

  it("stays generic when no error object is present", () => {
    expect(adminErrorMessage(null)).toBe(
      "This request could not be completed. Please try again."
    );
  });

  it("does not log when there is nothing to report", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    adminErrorMessage(undefined);
    expect(spy).not.toHaveBeenCalled();
  });
});