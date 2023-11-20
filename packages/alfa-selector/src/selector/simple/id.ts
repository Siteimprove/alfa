import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";

import { WithName } from "../selector";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#id-selector}
 */
export class Id extends WithName<"id"> {
  public static of(name: string): Id {
    return new Id(name);
  }

  private constructor(name: string) {
    super("id", name);
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
