import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { BaseNode } from "../node.js";

import { Element } from "./element.js";
import type { Slot } from "./slot.js";
import { Slotable } from "./slotable.js";

/**
 * @public
 */
export class Text extends Slotable<"text"> {
  public static of(
    data: string,
    box: Option<Rectangle> = None,
    device: Option<Device> = None,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ): Text {
    return new Text(data, box, device, externalId, internalId, extraData);
  }

  public static empty(): Text {
    return new Text("", None, None);
  }

  private readonly _data: string;
  private readonly _boxes: Cache<Device, Rectangle>;

  protected constructor(
    data: string,
    box: Option<Rectangle>,
    device: Option<Device>,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ) {
    super([], "text", externalId, internalId, extraData);

    this._data = data;

    this._boxes = Cache.from(
      device.isSome() && box.isSome() ? [[device.get(), box.get()]] : [],
    );
  }

  public get data(): string {
    return this._data;
  }

  public assignedSlot(): Option<Slot> {
    const name = this.slotableName();

    return this.parent()
      .filter(Element.isElement)
      .flatMap((parent) =>
        parent.shadow.flatMap((shadow) =>
          shadow
            .descendants()
            .filter(Element.isSlot)
            .find((slot) => slot.slotName() === name),
        ),
      );
  }

  public slotableName(): string {
    return "";
  }

  public getBoundingBox(device: Device): Option<Rectangle> {
    return this._boxes.get(device);
  }

  public is(predicate: Predicate<string>) {
    return predicate(this._data);
  }

  /**
   * @internal
   **/
  protected _internalPath(options?: BaseNode.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "text()";

    const index = this.index(options, Text.isText);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(
    options: BaseNode.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Text.MinimalJSON;
  public toJSON(options?: BaseNode.SerializationOptions): Text.JSON;
  public toJSON(
    options?: BaseNode.SerializationOptions,
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
    result.box =
      options?.device === undefined
        ? null
        : this._boxes
            .get(options.device)
            .map((box) => box.toJSON())
            .getOr(null);

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
  export interface MinimalJSON extends BaseNode.JSON<"text"> {}

  export interface JSON extends BaseNode.JSON<"text"> {
    data: string;
    box: Rectangle.JSON | null;
  }

  export function isText(value: unknown): value is Text {
    return value instanceof Text;
  }

  export function is(predicate: Predicate<string>): Predicate<Text> {
    return (text) => text.is(predicate);
  }

  /**
   * @internal
   */
  export function fromText(json: JSON, device?: Device): Trampoline<Text> {
    return Trampoline.done(
      Text.of(
        json.data,
        Option.from(json.box).map(Rectangle.from),
        Option.from(device),
        json.externalId,
        undefined,
        json.internalId,
      ),
    );
  }
}
