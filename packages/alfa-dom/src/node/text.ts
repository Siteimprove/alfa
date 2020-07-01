import { Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Element } from "./element";
import { Shadow } from "./shadow";
import { Slot } from "./slot";
import { Slotable } from "./slotable";
import { Trampoline } from "@siteimprove/alfa-trampoline";

export class Text extends Node implements Slotable {
  public static of(data: string): Text {
    return new Text(data);
  }

  public static empty(): Text {
    return new Text("");
  }

  private readonly _data: string;

  private constructor(data: string) {
    super([]);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.flattened === true) {
      return this._parent.flatMap((parent) => {
        if (Shadow.isShadow(parent)) {
          return parent.host;
        }

        if (Element.isElement(parent) && parent.shadow.isSome()) {
          return this.assignedSlot().flatMap((slot) => slot.parent(options));
        }

        return Option.of(parent);
      });
    }

    return this._parent;
  }

  public assignedSlot(): Option<Slot> {
    return Slotable.findSlot(this);
  }

  public path(options?: Node.Traversal): string {
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
    return {
      type: "text",
      data: this.data,
    };
  }

  public toString(): string {
    return this.data.trim();
  }
}

export namespace Text {
  export interface JSON extends Node.JSON {
    type: "text";
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
