import type { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { SimpleSelector } from "./simple";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#type-selector}
 */
export class Type extends SimpleSelector<"type"> {
  public static of(namespace: Option<string>, name: string): Type {
    return new Type(namespace, name);
  }

  private readonly _namespace: Option<string>;

  private constructor(namespace: Option<string>, name: string) {
    super("type", name);
    this._namespace = namespace;
  }

  public get namespace(): Option<string> {
    return this._namespace;
  }

  public matches(element: Element): boolean {
    if (this._name !== element.name) {
      return false;
    }

    if (this._namespace.isNone() || this._namespace.includes("*")) {
      return true;
    }

    return element.namespace.equals(this._namespace);
  }

  public equals(value: Type): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Type &&
      value._namespace.equals(this._namespace) &&
      value._name === this._name
    );
  }

  public *[Symbol.iterator](): Iterator<Type> {
    yield this;
  }

  public toJSON(): Type.JSON {
    return {
      ...super.toJSON(),
      namespace: this._namespace.getOr(null),
    };
  }

  public toString(): string {
    const namespace = this._namespace
      .map((namespace) => `${namespace}|`)
      .getOr("");

    return `${namespace}${this._name}`;
  }
}

export namespace Type {
  export interface JSON extends SimpleSelector.JSON<"type"> {
    namespace: string | null;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-type-selector}
   *
   * @internal
   */
  export const parse = map(SimpleSelector.parseName, ([namespace, name]) =>
    Type.of(namespace, name),
  );
}