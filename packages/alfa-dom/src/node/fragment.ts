import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node } from "../node";

/**
 * @public
 */
export class Fragment extends Node<"fragment"> {
  public static of(children: Iterable<Node>): Fragment {
    return new Fragment(Array.from(children));
  }

  public static empty(): Fragment {
    return new Fragment([]);
  }

  private constructor(children: Array<Node>) {
    super(children, "fragment");
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
  export function fromFragment(
    json: JSON,
    device?: Device
  ): Trampoline<Fragment> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      Node.fromNode(child, device)
    ).map((children) => Fragment.of(children));
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
