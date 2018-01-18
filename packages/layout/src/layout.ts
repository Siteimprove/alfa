export interface Layout {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export function width(layout: Layout): number {
  return layout.right - layout.left;
}

export function height(layout: Layout): number {
  return layout.bottom - layout.top;
}

export function area(layout: Layout): number {
  return width(layout) * height(layout);
}

export function margin(layout: Layout): number {
  return width(layout) + height(layout);
}

export function intersects(a: Layout, b: Layout): boolean {
  return (
    b.left <= a.right &&
    b.top <= a.bottom &&
    b.right >= a.left &&
    b.bottom >= a.top
  );
}

export function contains(a: Layout, b: Layout): boolean {
  return (
    a.left <= b.left &&
    a.top <= b.top &&
    b.right <= a.right &&
    b.bottom <= a.bottom
  );
}

export function union(...layouts: Layout[]): Layout {
  let top: number = Infinity;
  let right: number = -Infinity;
  let bottom: number = Infinity;
  let left: number = -Infinity;

  const { length } = layouts;

  for (let i = 0; i < length; i++) {
    const layout = layouts[i];
    left = Math.min(left, layout.left);
    right = Math.max(right, layout.right);
    top = Math.min(top, layout.top);
    bottom = Math.max(bottom, layout.bottom);
  }

  return { top, right, bottom, left };
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
        queue.push.apply(queue, next.children);
      }
    }

    return result;
  }
}

/**
 * Partition
 * @see http://ftp.informatik.rwth-aachen.de/Publications/CEUR-WS/Vol-74/files/FORUM_18.pdf
 */
function partition(
  nodes: Array<LayoutNode>,
  maximum: number,
  root: boolean = false
): LayoutNode {
  if (nodes.length <= maximum) {
    return Object.assign(union(...nodes), { children: nodes });
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

  nodes.sort((a, b) => a.left - b.left);

  for (let i = 0; i < slices; i++) {
    const chunk = Math.ceil(nodes.length / slices);
    const outer = nodes.slice(i * chunk, (i + 1) * chunk);

    outer.sort((a, b) => a.top - b.top);

    for (let j = 0; j < slices; j++) {
      const chunk = Math.ceil(outer.length / slices);
      const inner = outer.slice(j * chunk, (j + 1) * chunk);

      children.push(partition(inner, maximum));
    }
  }

  return Object.assign(union(...children), { children });
}
