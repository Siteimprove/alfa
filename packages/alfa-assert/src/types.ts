export interface Assertion {
  // Language
  to: this;
  be: this;

  // Flags
  not: this;

  // Assertions
  accessible: AssertionError | null;
}

export interface AssertionError extends Error {
  name: "AssertionError";
}
