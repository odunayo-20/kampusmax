// Node.js v25 provides a stub localStorage without methods.
// This polyfill ensures server-side code can safely call localStorage methods.
if (typeof window === "undefined") {
  const noop = () => "";
  const storage: Record<string, string> = {};
  if (typeof globalThis.localStorage === "undefined" || typeof globalThis.localStorage.getItem !== "function") {
    (globalThis as any).localStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = String(value); },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
      get length() { return Object.keys(storage).length; },
      key: (index: number) => Object.keys(storage)[index] ?? null,
    };
  }
  if (typeof globalThis.sessionStorage === "undefined" || typeof globalThis.sessionStorage.getItem !== "function") {
    (globalThis as any).sessionStorage = {
      getItem: noop,
      setItem: noop,
      removeItem: noop,
      clear: noop,
      get length() { return 0; },
      key: () => null,
    };
  }
}
