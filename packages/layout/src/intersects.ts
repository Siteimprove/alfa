import { Layout } from "./types";
import { top } from "./top";
import { right } from "./right";
import { bottom } from "./bottom";
import { left } from "./left";

export function intersects(a: Layout, b: Layout): boolean {
  return (
    left(b) <= right(a) &&
    top(b) <= bottom(a) &&
    right(b) >= left(a) &&
    bottom(b) >= top(a)
  );
}
