import { Diagnostic } from "@siteimprove/alfa-act";
import { Hash } from "@siteimprove/alfa-hash";
import { Rectangle } from "@siteimprove/alfa-rectangle";

export class WithBoundingBox extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(message: string, box: Rectangle): WithBoundingBox;

  public static of(message: string, box?: Rectangle): Diagnostic {
    return box === undefined
      ? new Diagnostic(message)
      : new WithBoundingBox(message, box);
  }

  private readonly _box: Rectangle;

  private constructor(message: string, box: Rectangle) {
    super(message);
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
  export interface JSON extends Diagnostic.JSON {
    box: Rectangle.JSON;
  }

  export function isWithBoundingBox(
    value: WithBoundingBox,
  ): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox;

  /** @public (knip) */
  export function isWithBoundingBox(value: unknown): value is WithBoundingBox {
    return value instanceof WithBoundingBox;
  }
}
