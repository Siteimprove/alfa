import { Layout } from "./types";
import { top } from "./top";
import { right } from "./right";
import { bottom } from "./bottom";
import { left } from "./left";

export function contains(a: Layout, b: Layout): boolean {
  return (
    left(a) <= left(b) &&
    top(a) <= top(b) &&
    right(b) <= right(a) &&
    bottom(b) <= bottom(a)
  );
}
