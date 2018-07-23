export function foo(foo: string): "foo" | "bar" {
  if (foo === "foo") {
    return "foo";
  } else {
    return "bar";
  }
}
