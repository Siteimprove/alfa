import { Device } from "@siteimprove/alfa-device";
import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Media } from "./media";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-type
 */
export class Type<T extends string = string>
  implements Media.Queryable<Type.JSON> {
  public static of<T extends string = string>(name: T): Type<T> {
    return new Type(name);
  }

  private readonly _name: T;

  private constructor(name: T) {
    this._name = name;
  }

  public get name(): T {
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

  public equals(value: unknown): value is this {
    return value instanceof Type && value._name === this._name;
  }

  public toJSON(): Type.JSON<T> {
    return {
      name: this._name,
    };
  }

  public toString(): string {
    return this._name;
  }
}

export namespace Type {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    name: T;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
   */
  export const parse = map(Token.parseIdent(), (ident) => Type.of(ident.value));
}
