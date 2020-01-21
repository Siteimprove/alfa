import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Slot } from "./slot";
import { Slotable } from "./slotable";

export class Text extends Node implements Slotable {
  public static of(data: string, parent: Option<Node> = None): Text {
    return new Text(data, parent);
  }

  private readonly _data: string;

  private constructor(data: string, parent: Option<Node>) {
    super(self => [], parent);

    this._data = data;
  }

  public get data(): string {
    return this._data;
  }

  public assignedSlot(): Option<Slot> {
    return Slotable.findSlot(this);
  }

  public toJSON(): Text.JSON {
    return {
      type: "text",
      data: this.data
    };
  }

  public toString(): string {
    return this.data.trim();
  }
}

export namespace Text {
  export function isText(value: unknown): value is Text {
    return value instanceof Text;
  }

  export interface JSON {
    type: "text";
    data: string;
  }

  export function fromText(text: JSON, parent: Option<Node> = None): Text {
    return Text.of(text.data, parent);
  }
}
