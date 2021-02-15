import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Media } from "./media";

const { map } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-type
 */
export class Type implements Media.Queryable {
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

  public get type(): "type" {
    return "type";
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

  public equals(value: Type): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Type && value._name === this._name;
  }

  public hash(hash: Hash) {
    Hash.writeString(hash, this._name);
  }

  public toJSON(): Type.JSON {
    return {
      type: "type",
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
    type: "type";
    name: string;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
   */
  export const parse = map(Token.parseIdent(), (ident) => Type.of(ident.value));
}
