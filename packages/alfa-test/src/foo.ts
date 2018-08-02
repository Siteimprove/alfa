export function foo(foo: string) {
  let p = 0;
  if (foo === "bar") {
    p++;
    if (p === 1) {
      p = 3 + 14 + (15 * 16 * 41) / (2 * 14);
      return p;
    }
  }
  --p;
  return p;
}
