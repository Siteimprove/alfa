import { Layout } from "./types";
import { top } from "./top";
import { right } from "./right";
import { bottom } from "./bottom";
import { left } from "./left";

export function union(...layouts: Array<Layout>): Layout {
  let minTop: number = Infinity;
  let maxRight: number = -Infinity;
  let maxBottom: number = Infinity;
  let minLeft: number = -Infinity;

  const { length } = layouts;

  for (let i = 0; i < length; i++) {
    const layout = layouts[i];
    minTop = Math.min(minTop, top(layout));
    maxRight = Math.max(maxRight, right(layout));
    maxBottom = Math.max(maxBottom, bottom(layout));
    minLeft = Math.min(minLeft, left(layout));
  }

  return {
    x: minLeft,
    y: minTop,
    width: maxRight - minLeft,
    height: maxBottom - minLeft
  };
}
