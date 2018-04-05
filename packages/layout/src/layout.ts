import { Layout } from "./types";
import { intersects } from "./intersects";
import { union } from "./union";

const { assign } = Object;

type LayoutNode = Layout & {
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
