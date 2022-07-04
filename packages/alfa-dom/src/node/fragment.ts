import { Trampoline } from "@siteimprove/alfa-trampoline";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import { Node } from "../node";

/**
 * @public
 */
export class Fragment extends Node<"fragment"> {
  public static of(
    children: Iterable<Node>,
    nodeId?: treeNode.Id.User
  ): Fragment {
    return new Fragment(Array.from(children), nodeId ?? Node.Id.create());
  }

  public static empty(): Fragment {
    return new Fragment([], Node.Id.create());
  }

  private constructor(
    children: Array<Node>,
    nodeId: Node.Id | treeNode.Id.User
  ) {
    super(children, "fragment", nodeId);
  }

  /**
   * @internal
   **/
  protected _internalPath(): string {
    return "/";
  }

  public toString(): string {
    const children = this._children
      .map((child) => indent(child.toString()))
      .join("\n");

    return `#document-fragment${children === "" ? "" : `\n${children}`}`;
  }

  /**
   * @internal
   */
  public _attachParent(): boolean {
    return false;
  }
}

/**
 * @public
 */
export namespace Fragment {
  export interface JSON extends Node.JSON<"fragment"> {}

  export function isFragment(value: unknown): value is Fragment {
    return value instanceof Fragment;
  }

  /**
   * @internal
   */
  export function fromFragment(json: JSON): Trampoline<Fragment> {
    return Trampoline.traverse(json.children ?? [], Node.fromNode).map(
      (children) => Fragment.of(children)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
