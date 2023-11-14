import { Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node } from "../node";
import { Element } from "./element";
import { Shadow } from "./shadow";
import { Slot } from "./slot";
import { Slotable } from "./slotable";

/**
 * @public
 */
export class Text extends Node<"text"> implements Slotable {
  public static of(data: string, externalId?: string, extraData?: any): Text {
    return new Text(data, externalId, extraData);
  }

  public static empty(): Text {
    return new Text("");
  }

  private readonly _data: string;

  private constructor(data: string, externalId?: string, extraData?: any) {
    super([], "text", externalId, extraData);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  public parent(options: Node.Traversal = Node.Traversal.empty): Option<Node> {
    const parent = this._parent as Option<Node>;

    if (options.isSet(Node.Traversal.flattened)) {
      return parent.flatMap((parent) => {
        if (Shadow.isShadow(parent)) {
          return parent.host;
        }

        if (Element.isElement(parent) && parent.shadow.isSome()) {
          return this.assignedSlot().flatMap((slot) => slot.parent(options));
        }

        return Option.of(parent);
      });
    }

    return parent;
  }

  public assignedSlot(): Option<Slot> {
    return Slotable.findSlot(this);
  }

  /**
   * @internal
   **/
  protected _internalPath(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "text()";

    const index = this.preceding(options).count(Text.isText);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(): Text.JSON {
    const result = {
      ...super.toJSON(),
      data: this.data,
    };
    delete result.children;

    return result;
  }

  public toString(): string {
    return this.data.trim();
  }
}

/**
 * @public
 */
export namespace Text {
  export interface JSON extends Node.JSON<"text"> {
    data: string;
  }

  export function isText(value: unknown): value is Text {
    return value instanceof Text;
  }

  /**
   * @internal
   */
  export function fromText(json: JSON): Trampoline<Text> {
    return Trampoline.done(Text.of(json.data));
  }
}
