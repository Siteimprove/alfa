export function foo(foo: string): "foo" | "bar" {
  if (foo === "bar") {
    let b = 8;
    b = b + 1;

    let c = 8;
    c = c + 1;
  }

  if (foo === "foo") {
    return "foo";
  }

  let a = 8;
  a = a + 1;

  return "bar";
}
