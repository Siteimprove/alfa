import { Device } from "@siteimprove/alfa-device";
import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Media } from "./media";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-type
 */
export class Type implements Media.Queryable<Type.JSON> {
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

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
   */
  export const parse = map(Token.parseIdent(), (ident) => Type.of(ident.value));
}
