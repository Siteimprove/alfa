import { Node, Parent } from "./types";
import { isChild } from "./guards";

function pathFromRoot(node: Node): Array<Node> {
  const path: Array<Node> = [];

  for (
    let next: Node | null = node;
    next;
    next = isChild(next) ? next.parent : null
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

export function compare(a: Node, b: Node): number {
  const ap = pathFromRoot(a);
  const bp = pathFromRoot(b);

  const fork = forkingPoint(ap, bp);

  if (a === ap[fork]) {
    return -1;
  }

  if (b === bp[fork]) {
    return 1;
  }

  const { children = [] } = ap[fork] as Parent;

  a = ap[fork + 1];
  b = bp[fork + 1];

  const n = children.length;

  for (let i = 0; i < n; i++) {
    const child = children[i];

    if (child === a) {
      return -1;
    }

    if (child === b) {
      return 1;
    }
  }

  return 0;
}
