import { Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node } from "../node";
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

  /**
   * @internal
   */
  export function cloneText(text: Text) {
    return Trampoline.done(Text.of(text.data, text.externalId));
  }
}
