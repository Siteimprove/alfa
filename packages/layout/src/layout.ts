const { assign } = Object;

/**
 * @see https://www.w3.org/TR/geometry/#DOMRect
 */
export interface Layout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-width
 */
export function width(layout: Layout): number {
  return layout.width;
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-height
 */
export function height(layout: Layout): number {
  return layout.height;
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-top
 */
export function top(layout: Layout): number {
  return Math.min(layout.y, layout.y + layout.height);
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function right(layout: Layout): number {
  return Math.max(layout.x, layout.x + layout.width);
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function bottom(layout: Layout): number {
  return Math.max(layout.y, layout.y + layout.height);
}

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function left(layout: Layout): number {
  return Math.min(layout.x, layout.x + layout.width);
}

export function area(layout: Layout): number {
  return width(layout) * height(layout);
}

export function margin(layout: Layout): number {
  return width(layout) + height(layout);
}

export function intersects(a: Layout, b: Layout): boolean {
  return (
    left(b) <= right(a) &&
    top(b) <= bottom(a) &&
    right(b) >= left(a) &&
    bottom(b) >= top(a)
  );
}

export function contains(a: Layout, b: Layout): boolean {
  return (
    left(a) <= left(b) &&
    top(a) <= top(b) &&
    right(b) <= right(a) &&
    bottom(b) <= bottom(a)
  );
}

export function union(...layouts: Layout[]): Layout {
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

export type LayoutNode = Layout & {
  children?: Array<LayoutNode>;
};

export class LayoutIndex {
  private _root: LayoutNode;

  constructor(layouts: Array<Layout>) {
    this._root = partition(layouts.slice(), 9, true);
  }

  within(target: Layout): Array<Layout> {
    const result: Array<Layout> = [];
    const queue: Array<LayoutNode> = [];

    for (
      let next: LayoutNode | undefined = this._root;
      next;
      next = queue.pop()
    ) {
      if (!intersects(target, next)) {
        continue;
      }

      if (next.children === undefined) {
        result.push(next);
      } else {
        queue.push(...next.children);
      }
    }

    return result;
  }
}

/**
 * @see http://ftp.informatik.rwth-aachen.de/Publications/CEUR-WS/Vol-74/files/FORUM_18.pdf
 */
function partition(
  nodes: Array<LayoutNode>,
  maximum: number,
  root: boolean = false
): LayoutNode {
  if (nodes.length <= maximum) {
    return assign(union(...nodes), { children: nodes });
  }

  let slices = maximum;

  if (root) {
    const { length } = nodes;
    // OMT Eq. 1: Determine the desired height of the r-tree.
    const height = Math.ceil(Math.log(length) / Math.log(maximum));
    // OMT Eq. 2: Determine the desired size of every root entry.
    const subtree = Math.ceil(length / Math.pow(maximum, height - 1));
    // OMT Eq. 3: Determine the number of entries at the root.
    slices = Math.floor(Math.sqrt(Math.ceil(length / subtree)));
  }

  const children: Array<LayoutNode> = [];

  nodes.sort((a, b) => a.x - b.x);

  for (let i = 0; i < slices; i++) {
    const chunk = Math.ceil(nodes.length / slices);
    const outer = nodes.slice(i * chunk, (i + 1) * chunk);

    outer.sort((a, b) => a.y - b.y);

    for (let j = 0; j < slices; j++) {
      const chunk = Math.ceil(outer.length / slices);
      const inner = outer.slice(j * chunk, (j + 1) * chunk);

      children.push(partition(inner, maximum));
    }
  }

  return assign(union(...children), { children });
}
