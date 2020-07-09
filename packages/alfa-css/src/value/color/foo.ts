import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Number } from "../number";

const { map } = Parser;

export class Foo
  implements Equatable, Hashable, Serializable {
  public static of(color: "foo"): Foo {
    return new Foo(color);
  }

  private readonly _color: "foo";

  private constructor(color: "foo") {
    this._color = color;
  }

  public get type(): "color" {
    return "color";
  }

  public get format(): "fooformat" {
    return "fooformat";
  }

  public get color(): "foo" {
    return this._color;
  }

  public get red(): Number {
    return Number.of(0);
  }

  public get green(): Number {
    return Number.of(255);
  }

  public get blue(): Number {
    return Number.of(255);
  }

  public get alpha(): Number {
    // The "transparent" color has an alpha of 0 as it's, well, transparent. All
    // other named colors are fully opaque and therefore have an alpha of 1.
    return Number.of(0);
  }

  public equals(value: unknown): value is this {
    return value instanceof Foo && value._color === this._color;
  }

  public hash(hash: Hash): void {
    Hash.writeString(hash, this._color);
  }

  public toJSON(): Foo.JSON {
    return {
      type: "color",
      format: "fooformat",
      color: this._color,
    };
  }

  public toString(): string {
    return this._color;
  }
}

export namespace Foo {
  export interface JSON {
    [key: string]: json.JSON;
    type: "color";
    format: "fooformat";
    color: "foo";
  }

  export function isFoo(value: unknown): value is Foo {
    return value instanceof Foo
  }

  export const parse = map(
    Token.parseIdent((ident) => ident.value === "foo"),
    (ident) => Foo.of("foo")
  );
}
