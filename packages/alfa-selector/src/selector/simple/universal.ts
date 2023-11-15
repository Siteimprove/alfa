import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { None, type Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Selector } from "../selector";
import { SimpleSelector } from "./simple";

const { left, map, option } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#universal-selector}
 */
export class Universal extends Selector<"universal"> {
  public static of(namespace: Option<string>): Universal {
    return new Universal(namespace);
  }

  private static readonly _empty = new Universal(None);

  public static empty(): Universal {
    return this._empty;
  }

  private readonly _namespace: Option<string>;

  private constructor(namespace: Option<string>) {
    super("universal");
    this._namespace = namespace;
  }

  public get namespace(): Option<string> {
    return this._namespace;
  }

  public matches(element: Element): boolean {
    if (this._namespace.isNone() || this._namespace.includes("*")) {
      return true;
    }

    return element.namespace.equals(this._namespace);
  }

  public equals(value: Universal): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Universal && value._namespace.equals(this._namespace)
    );
  }

  public *[Symbol.iterator](): Iterator<Universal> {
    yield this;
  }

  public toJSON(): Universal.JSON {
    return {
      ...super.toJSON(),
      namespace: this._namespace.getOr(null),
    };
  }

  public toString(): string {
    const namespace = this._namespace
      .map((namespace) => `${namespace}|`)
      .getOr("");

    return `${namespace}*`;
  }
}

export namespace Universal {
  export interface JSON extends Selector.JSON<"universal"> {
    namespace: string | null;
  }

  export function isUniversal(value: unknown): value is Universal {
    return value instanceof Universal;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-type-selector}
   */
  export const parse = map(
    left(option(SimpleSelector.parseNamespace), Token.parseDelim("*")),
    (namespace) => Universal.of(namespace),
  );
}
