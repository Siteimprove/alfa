import { Device } from "@siteimprove/alfa-device";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Iterable } from "@siteimprove/alfa-iterable";
import { Node } from "../node";
import { Element } from "./element";

/**
 * @public
 */
export class Fragment extends Node<"fragment"> {
  public static of(
    children: Iterable<Node>,
    externalId?: string,
    extraData?: any,
  ): Fragment {
    return new Fragment(Array.from(children), externalId, extraData);
  }

  public static empty(): Fragment {
    return new Fragment([]);
  }

  private constructor(
    children: Array<Node>,
    externalId?: string,
    extraData?: any,
  ) {
    super(children, "fragment", externalId, extraData);
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
    device?: Device,
  ): Trampoline<Fragment> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      Node.fromNode(child, device),
    ).map((children) => Fragment.of(children));
  }

  /**
   * @internal
   */
  export function cloneFragment(
    options: Node.ElementReplacementOptions,
    device?: Device,
  ): (fragment: Fragment) => Trampoline<Fragment> {
    return (fragment) =>
      Trampoline.traverse(fragment.children(), (child) => {
        if (Element.isElement(child) && options.predicate(child)) {
          return Trampoline.done(Array.from(options.newElements));
        }

        return Node.cloneNode(child, options, device).map((node) => [node]);
      }).map((children) => {
        return Fragment.of(Iterable.flatten(children), fragment.externalId);
      });
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
