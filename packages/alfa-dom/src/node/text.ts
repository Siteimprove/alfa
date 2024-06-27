import { Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Node } from "../node.js";
import { Slot } from "./slot.js";
import { Slotable } from "./slotable.js";

/**
 * @public
 */
export class Text extends Node<"text"> implements Slotable {
  public static of(
    data: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ): Text {
    return new Text(data, externalId, serializationId, extraData);
  }

  public static empty(): Text {
    return new Text("");
  }

  private readonly _data: string;

  private constructor(
    data: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super([], "text", externalId, serializationId, extraData);

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

  public toJSON(
    options: Node.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Text.MinimalJSON;
  public toJSON(options?: Node.SerializationOptions): Text.JSON;
  public toJSON(
    options?: Node.SerializationOptions,
  ): Text.MinimalJSON | Text.JSON {
    const result = {
      ...super.toJSON(options),
    };
    delete result.children;

    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    if (verbosity < json.Serializable.Verbosity.Medium) {
      return result;
    }

    result.data = this.data;

    return result;
  }

  public toString(): string {
    const value = this.data;

    // If the child is only spaces, we do not want to trim them to nothingness.
    if (value.match(/\s+/) !== null) {
      return value;
    }

    return value.trim();
  }
}

/**
 * @public
 */
export namespace Text {
  export interface MinimalJSON extends Node.JSON<"text"> {}

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
    return Trampoline.done(
      Text.of(json.data, json.externalId, undefined, json.serializationId),
    );
  }

  /**
   * @internal
   */
  export function cloneText(text: Text) {
    return Trampoline.done(
      Text.of(text.data, text.externalId, text.extraData, text.serializationId),
    );
  }
}
