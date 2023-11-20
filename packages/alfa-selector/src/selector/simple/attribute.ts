import { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { WithName } from "../selector";

import { parseName } from "./parser";

const { delimited, either, left, map, option, pair } = Parser;
const { and, equals, property } = Predicate;

/**
 * {@link https://drafts.csswg.org/selectors/#attribute-selector}
 */
export class Attribute extends WithName<"attribute"> {
  public static of(
    namespace: Option<string>,
    name: string,
    value: Option<string> = None,
    matcher: Option<Attribute.Matcher> = None,
    modifier: Option<Attribute.Modifier> = None,
  ): Attribute {
    return new Attribute(namespace, name, value, matcher, modifier);
  }

  private readonly _namespace: Option<string>;
  private readonly _value: Option<string>;
  private readonly _matcher: Option<Attribute.Matcher>;
  private readonly _modifier: Option<Attribute.Modifier>;

  private constructor(
    namespace: Option<string>,
    name: string,
    value: Option<string>,
    matcher: Option<Attribute.Matcher>,
    modifier: Option<Attribute.Modifier>,
  ) {
    super("attribute", name);
    this._namespace = namespace;
    this._value = value;
    this._matcher = matcher;
    this._modifier = modifier;
  }

  public get namespace(): Option<string> {
    return this._namespace;
  }

  public get value(): Option<string> {
    return this._value;
  }

  public get matcher(): Option<Attribute.Matcher> {
    return this._matcher;
  }

  public get modifier(): Option<Attribute.Modifier> {
    return this._modifier;
  }

  public matches(element: Element): boolean {
    for (const namespace of this._namespace) {
      let predicate: Predicate<dom.Attribute>;

      switch (namespace) {
        case "*":
          predicate = property("name", equals(this._name));
          break;

        case "":
          predicate = and(
            property("name", equals(this._name)),
            property("namespace", equals(None)),
          );
          break;

        default:
          predicate = and(
            property("name", equals(this._name)),
            property("namespace", equals(namespace)),
          );
      }

      return Iterable.some(
        element.attributes,
        and(predicate, (attribute) => this.matchesValue(attribute.value)),
      );
    }

    return element
      .attribute(this._name)
      .some((attribute) => this.matchesValue(attribute.value));
  }

  private matchesValue(value: string): boolean {
    for (const modifier of this._modifier) {
      switch (modifier) {
        case Attribute.Modifier.CaseInsensitive:
          value = value.toLowerCase();
      }
    }

    for (const match of this._value) {
      switch (this._matcher.getOr(Attribute.Matcher.Equal)) {
        case Attribute.Matcher.Equal:
          return value === match;

        case Attribute.Matcher.Prefix:
          return value.startsWith(match);

        case Attribute.Matcher.Suffix:
          return value.endsWith(match);

        case Attribute.Matcher.Substring:
          return value.includes(match);

        case Attribute.Matcher.DashMatch:
          return value === match || value.startsWith(`${match}-`);

        case Attribute.Matcher.Includes:
          return value.split(/\s+/).some(equals(match));
      }
    }

    return true;
  }

  public equals(value: Attribute): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Attribute &&
      value._namespace.equals(this._namespace) &&
      value._name === this._name &&
      value._value.equals(this._value) &&
      value._matcher.equals(this._matcher) &&
      value._modifier.equals(this._modifier)
    );
  }

  public *[Symbol.iterator](): Iterator<Attribute> {
    yield this;
  }

  public toJSON(): Attribute.JSON {
    return {
      ...super.toJSON(),
      namespace: this._namespace.getOr(null),
      value: this._value.getOr(null),
      matcher: this._matcher.getOr(null),
      modifier: this._modifier.getOr(null),
    };
  }

  public toString(): string {
    const namespace = this._namespace
      .map((namespace) => `${namespace}|`)
      .getOr("");

    const value = this._value
      .map((value) => `"${JSON.stringify(value)}"`)
      .getOr("");

    const matcher = this._matcher.getOr("");

    const modifier = this._modifier.map((modifier) => ` ${modifier}`).getOr("");

    return `[${namespace}${this._name}${matcher}${value}${modifier}]`;
  }
}

export namespace Attribute {
  export interface JSON extends WithName.JSON<"attribute"> {
    namespace: string | null;
    value: string | null;
    matcher: string | null;
    modifier: string | null;
  }

  export enum Matcher {
    /**
     * @example [foo=bar]
     */
    Equal = "=",

    /**
     * @example [foo~=bar]
     */
    Includes = "~=",

    /**
     * @example [foo|=bar]
     */
    DashMatch = "|=",

    /**
     * @example [foo^=bar]
     */
    Prefix = "^=",

    /**
     * @example [foo$=bar]
     */
    Suffix = "$=",

    /**
     * @example [foo*=bar]
     */
    Substring = "*=",
  }

  export enum Modifier {
    /**
     * @example [foo=bar i]
     */
    CaseInsensitive = "i",

    /**
     * @example [foo=Bar s]
     */
    CaseSensitive = "s",
  }

  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-attr-matcher}
   */
  const parseMatcher = map(
    left(
      option(
        either(
          Token.parseDelim("~"),
          Token.parseDelim("|"),
          Token.parseDelim("^"),
          Token.parseDelim("$"),
          Token.parseDelim("*"),
        ),
      ),
      Token.parseDelim("="),
    ),
    (delim) =>
      delim.isSome()
        ? (`${delim.get()}=` as Attribute.Matcher)
        : Attribute.Matcher.Equal,
  );

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-attr-modifier}
   */
  const parseModifier = either(
    map(Token.parseIdent("i"), () => Attribute.Modifier.CaseInsensitive),
    map(Token.parseIdent("s"), () => Attribute.Modifier.CaseSensitive),
  );

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-attribute-selector}
   *
   * @internal
   */
  export const parse = map(
    delimited(
      Token.parseOpenSquareBracket,
      pair(
        parseName,
        option(
          pair(
            pair(parseMatcher, either(Token.parseString(), Token.parseIdent())),
            delimited(option(Token.parseWhitespace), option(parseModifier)),
          ),
        ),
      ),
      Token.parseCloseSquareBracket,
    ),
    (result) => {
      const [[namespace, name], rest] = result;

      if (rest.isSome()) {
        const [[matcher, value], modifier] = rest.get();

        return Attribute.of(
          namespace,
          name,
          Option.of(value.value),
          Option.of(matcher),
          modifier,
        );
      }

      return Attribute.of(namespace, name);
    },
  );
}
