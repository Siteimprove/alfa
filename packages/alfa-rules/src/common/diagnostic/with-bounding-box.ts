import { Diagnostic } from "@siteimprove/alfa-act";
import { Hash } from "@siteimprove/alfa-hash";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { WithName } from "./with-name";

export class WithBoundingBox extends WithName {
  public static of(message: string): Diagnostic;

  public static of(message: string, name: string): WithName;

  public static of(
    message: string,
    name: string,
    box: Rectangle,
  ): WithBoundingBox;

  public static of(
    message: string,
    name?: string,
    box?: Rectangle,
  ): Diagnostic {
    if (name === undefined) {
      return new Diagnostic(message);
    }

    if (box === undefined) {
      return new WithName(message, name);
    }

    return new WithBoundingBox(message, name, box);
  }

  protected readonly _box: Rectangle;

  protected constructor(message: string, name: string, box: Rectangle) {
    super(message, name);
    this._box = box;
  }

  public get box(): Rectangle {
    return this._box;
  }

  public equals(value: WithBoundingBox): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithBoundingBox &&
      value._message === this._message &&
      value._name === this._name &&
      value._box.equals(this._box)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._box.hash(hash);
  }

  public toJSON(): WithBoundingBox.JSON {
    return {
      ...super.toJSON(),
      box: this._box.toJSON(),
    };
  }
}

export namespace WithBoundingBox {
  export interface JSON extends WithName.JSON {
    box: Rectangle.JSON;
  }

  export function isWithBoundingBox(
    value: WithBoundingBox,
  ): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox {
    return value instanceof WithBoundingBox;
  }
}
