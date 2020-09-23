import { Node } from "../node";
import { Trampoline } from "@siteimprove/alfa-trampoline";

export class Fragment extends Node {
  public static of(children: Iterable<Node>): Fragment {
    return new Fragment(Array.from(children));
  }

  public static empty(): Fragment {
    return new Fragment([]);
  }

  private constructor(children: Array<Node>) {
    super(children);
  }

  public path(): string {
    return "/";
  }

  protected _structurallyEquals(value: unknown): value is this {
    return value instanceof Fragment && super._structurallyEquals(value);
  }

  public toJSON(): Fragment.JSON {
    return {
      type: "fragment",
      children: this._children.map((child) => child.toJSON()),
    };
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

export namespace Fragment {
  export interface JSON extends Node.JSON {
    type: "fragment";
    children: Array<Node.JSON>;
  }

  export function isFragment(value: unknown): value is Fragment {
    return value instanceof Fragment;
  }

  /**
   * @internal
   */
  export function fromFragment(json: JSON): Trampoline<Fragment> {
    return Trampoline.traverse(json.children, Node.fromNode).map((children) =>
      Fragment.of(children)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
