import { Node } from "./types";
import { getParentNode } from "./get-parent-node";

function pathFromRoot(node: Node, context: Node): Array<Node> {
  const path: Array<Node> = [];

  for (
    let next: Node | null = node;
    next;
    next = getParentNode(next, context)
  ) {
    path.unshift(next);
  }

  return path;
}

function forkingPoint(a: Array<any>, b: Array<any>) {
  let fork = 0;

  const n = Math.min(a.length, b.length);

  for (let i = fork; i < n; i++) {
    if (a[i] !== b[i]) {
      break;
    }

    fork = i;
  }

  return fork;
}

export function compare(a: Node, b: Node, context: Node): number {
  const ap = pathFromRoot(a, context);
  const bp = pathFromRoot(b, context);

  const fork = forkingPoint(ap, bp);

  if (a === ap[fork]) {
    return -1;
  }

  if (b === bp[fork]) {
    return 1;
  }

  const { childNodes } = ap[fork];

  a = ap[fork + 1];
  b = bp[fork + 1];

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const child = childNodes[i];

    if (child === a) {
      return -1;
    }

    if (child === b) {
      return 1;
    }
  }

  return 0;
}
