import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Parser } from "@siteimprove/alfa-parser";
import type { Feature } from "../feature.js";

import type * as json from "@siteimprove/alfa-json";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-types}
 *
 * @public
 */
export class Type implements Feature<Type> {
  public static of(name: string): Type {
    return new Type(name);
  }

  private readonly _name: string;

  private constructor(name: string) {
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public matches(device: Device): boolean {
    switch (this._name) {
      case "screen":
        return device.type === Device.Type.Screen;

      case "print":
        return device.type === Device.Type.Print;

      case "speech":
        return device.type === Device.Type.Speech;

      case "all":
        return true;

      default:
        return false;
    }
  }

  private *iterator(): Iterator<Type> {
    yield this;
  }

  public [Symbol.iterator](): Iterator<Type> {
    return this.iterator();
  }

  public equals(value: unknown): value is this {
    return value instanceof Type && value._name === this._name;
  }

  public toJSON(): Type.JSON {
    return {
      name: this._name,
    };
  }

  public toString(): string {
    return this._name;
  }
}

export namespace Type {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-type}
   */
  export const parse = map(
    Token.parseIdent((ident) => {
      switch (ident.value) {
        // These values are not allowed as media types.
        case "only":
        case "not":
        case "and":
        case "or":
          return false;

        default:
          return true;
      }
    }),
    (ident) => Type.of(ident.value),
  );
}
