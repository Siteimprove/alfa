import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Specificity } from "../../specificity.js";

import { WithName } from "../selector.js";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#id-selector}
 *
 * @public
 */
export class Id extends WithName<"id"> {
  public static of(name: string): Id {
    return new Id(name);
  }

  protected readonly _key: Option<Id>;

  protected constructor(name: string) {
    super("id", name, Specificity.of(1, 0, 0));

    this._key = Option.of(this);
  }

  public matches(element: Element): boolean {
    return element.id.includes(this._name);
  }

  public equals(value: Id): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Id && value._name === this._name;
  }

  public *[Symbol.iterator](): Iterator<Id> {
    yield this;
  }

  public toJSON(): Id.JSON {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `#${this._name}`;
  }
}

/**
 * @public
 */
export namespace Id {
  export interface JSON extends WithName.JSON<"id"> {}

  export function isId(value: unknown): value is Id {
    return value instanceof Id;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-id-selector}
   *
   * @internal
   */
  export const parse = map(
    Token.parseHash((hash) => hash.isIdentifier),
    (hash) => Id.of(hash.value),
  );
}
