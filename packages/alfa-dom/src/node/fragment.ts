import type { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { BaseNode } from "./node.js";

import type { Node } from "./index.js";

/**
 * @public
 */
export class Fragment extends BaseNode<"fragment"> {
  public static of(
    children: Iterable<Node>,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ): Fragment {
    return new Fragment(
      Array.from(children),
      externalId,
      internalId,
      extraData,
    );
  }

  public static empty(): Fragment {
    return new Fragment([]);
  }

  protected constructor(
    children: Array<Node>,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ) {
    super(children, "fragment", externalId, internalId, extraData);
  }

  /**
   * @internal
   **/
  protected _internalPath(): string {
    return "/";
  }

  public toString(): string {
    const children = this._children
      .map((child) => String.indent(child.toString()))
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
  export interface JSON extends BaseNode.JSON<"fragment"> {}

  export function isFragment(value: unknown): value is Fragment {
    return value instanceof Fragment;
  }

  /**
   * @internal
   */
  export function fromFragment(
    json: JSON,
    fromNode: (json: Node.JSON, device?: Device) => Trampoline<Node>,
    device?: Device,
  ): Trampoline<Fragment> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      fromNode(child, device),
    ).map((children) => Fragment.of(children));
  }
}
