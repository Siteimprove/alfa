import { Diagnostic } from "@siteimprove/alfa-act";
import { Hash } from "@siteimprove/alfa-hash";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import { WithName } from "./with-name";

import * as json from "@siteimprove/alfa-json";

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
    name: string,
    box: Rectangle,
    condition: WithBoundingBox.Condition,
  ): WithBoundingBox;

  public static of(
    message: string,
    name?: string,
    box?: Rectangle,
    condition?: WithBoundingBox.Condition,
  ): Diagnostic {
    if (name === undefined) {
      return new Diagnostic(message);
    }

    if (box === undefined) {
      return new WithName(message, name);
    }

    if (condition === undefined) {
      return new WithBoundingBox(message, name, box, {});
    }

    return new WithBoundingBox(message, name, box, condition);
  }

  protected readonly _box: Rectangle;
  protected readonly _condition: WithBoundingBox.Condition;

  protected constructor(
    message: string,
    name: string,
    box: Rectangle,
    condition: WithBoundingBox.Condition,
  ) {
    super(message, name);
    this._box = box;
    this._condition = condition;
  }

  public get box(): Rectangle {
    return this._box;
  }

  public get condition(): WithBoundingBox.Condition {
    return this._condition;
  }

  public equals(value: WithBoundingBox): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithBoundingBox &&
      value._message === this._message &&
      value._name === this._name &&
      value._box.equals(this._box) &&
      value._condition.size === this._condition.size &&
      value._condition.spacing === this._condition.spacing
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._box.hash(hash);
    hash.writeUnknown(this._condition.size);
    hash.writeUnknown(this._condition.spacing);
  }

  public toJSON(): WithBoundingBox.JSON {
    return {
      ...super.toJSON(),
      box: this._box.toJSON(),
      condition: {
        type: "condition",
        size: this._condition.size,
        spacing: this._condition.spacing,
      },
    };
  }
}

export namespace WithBoundingBox {
  export interface JSON extends WithName.JSON {
    box: Rectangle.JSON;
    condition: json.JSON;
  }

  export interface Condition {
    size?: boolean;
    spacing?: boolean;
  }

  export function isWithBoundingBox(
    value: WithBoundingBox,
  ): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox {
    return value instanceof WithBoundingBox;
  }
}
