export function foo(foo: string): "foo" | "bar" {
  if (foo !== "bar") {
    return foo !== "bar" && foo === "bar" ? "foo" : "bar";
  }

  return "foo";
}
