import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Specificity } from "../../specificity";

import { WithName } from "../selector";

const { map, right } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#class-selector}
 *
 * @public
 */
export class Class extends WithName<"class"> {
  public static of(name: string): Class {
    return new Class(name);
  }
  private constructor(name: string) {
    super("class", name, Specificity.of(0, 1, 0));
  }

  public matches(element: Element): boolean {
    return Iterable.includes(element.classes, this._name);
  }

  public equals(value: Class): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): value is boolean {
    return value instanceof Class && value._name === this._name;
  }

  public *[Symbol.iterator](): Iterator<Class> {
    yield this;
  }

  public toJSON(): Class.JSON {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `.${this._name}`;
  }
}

/**
 * @public
 */
export namespace Class {
  export interface JSON extends WithName.JSON<"class"> {}

  export function isClass(value: unknown): value is Class {
    return value instanceof Class;
  }

  /**
   * @internal
   */
  export const parse = map(
    right(Token.parseDelim("."), Token.parseIdent()),
    (ident) => Class.of(ident.value),
  );
}
