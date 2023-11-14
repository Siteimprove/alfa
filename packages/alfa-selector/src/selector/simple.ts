import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import {
  Function,
  Nth,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import * as dom from "@siteimprove/alfa-dom";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Slice } from "@siteimprove/alfa-slice";

import type { Complex } from "./complex";
import { Compound } from "./compound";
import { Context } from "../context";
import type { List } from "./list";
import { Selector } from "./selector";

const { State } = Context;

const {
  delimited,
  either,
  end,
  flatMap,
  left,
  map,
  mapResult,
  option,
  pair,
  peek,
  right,
  separatedList,
  take,
  takeBetween,
} = Parser;

const { and, equals, not, property, test } = Predicate;
const { isElement, hasName } = Element;

/**
 * {@link https://drafts.csswg.org/selectors/#id-selector}
 */
export class Id extends Selector<"id"> {
  public static of(name: string): Id {
    return new Id(name);
  }

  private readonly _name: string;

  private constructor(name: string) {
    super("id");
    this._name = name;
  }

  public get name(): string {
    return this._name;
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
      name: this._name,
    };
  }

  public toString(): string {
    return `#${this._name}`;
  }
}

export namespace Id {
  export interface JSON extends Selector.JSON<"id"> {
    name: string;
  }

  export function isId(value: unknown): value is Id {
    return value instanceof Id;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-id-selector}
   *
   * @internal
   */
  export const parseId = map(
    Token.parseHash((hash) => hash.isIdentifier),
    (hash) => Id.of(hash.value),
  );
}
/**
 * {@link https://drafts.csswg.org/selectors/#class-selector}
 */
export class Class extends Selector<"class"> {
  public static of(name: string): Class {
    return new Class(name);
  }

  private readonly _name: string;

  private constructor(name: string) {
    super("class");
    this._name = name;
  }

  public get name(): string {
    return this._name;
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
      name: this._name,
    };
  }

  public toString(): string {
    return `.${this._name}`;
  }
}

export namespace Class {
  export interface JSON extends Selector.JSON<"class"> {
    name: string;
  }

  export function isClass(value: unknown): value is Class {
    return value instanceof Class;
  }

  /**
   * @internal
   */
  export const parseClass = map(
    right(Token.parseDelim("."), Token.parseIdent()),
    (ident) => Class.of(ident.value),
  );
}
/**
 * {@link https://drafts.csswg.org/selectors/#typedef-ns-prefix}
 */
const parseNamespace = map(
  left(
    option(either(Token.parseIdent(), Token.parseDelim("*"))),
    Token.parseDelim("|"),
  ),
  (token) => token.map((token) => token.toString()).getOr(""),
);

/**
 * {@link https://drafts.csswg.org/selectors/#typedef-wq-name}
 */
const parseName = pair(
  option(parseNamespace),
  map(Token.parseIdent(), (ident) => ident.value),
);

/**
 * {@link https://drafts.csswg.org/selectors/#attribute-selector}
 */
export class Attribute extends Selector<"attribute"> {
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
  private readonly _name: string;
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
    super("attribute");
    this._namespace = namespace;
    this._name = name;
    this._value = value;
    this._matcher = matcher;
    this._modifier = modifier;
  }

  public get namespace(): Option<string> {
    return this._namespace;
  }

  public get name(): string {
    return this._name;
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
      name: this._name,
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
  export interface JSON extends Selector.JSON<"attribute"> {
    namespace: string | null;
    name: string;
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
          either(
            Token.parseDelim("|"),
            either(
              Token.parseDelim("^"),
              either(Token.parseDelim("$"), Token.parseDelim("*")),
            ),
          ),
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
  export const parseAttribute = map(
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

/**
 * {@link https://drafts.csswg.org/selectors/#type-selector}
 */
export class Type extends Selector<"type"> {
  public static of(namespace: Option<string>, name: string): Type {
    return new Type(namespace, name);
  }

  private readonly _namespace: Option<string>;
  private readonly _name: string;

  private constructor(namespace: Option<string>, name: string) {
    super("type");
    this._namespace = namespace;
    this._name = name;
  }

  public get namespace(): Option<string> {
    return this._namespace;
  }

  public get name(): string {
    return this._name;
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
      name: this._name,
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
  export interface JSON extends Selector.JSON<"type"> {
    namespace: string | null;
    name: string;
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-type-selector}
   *
   * @internal
   */
  export const parseType = map(parseName, ([namespace, name]) =>
    Type.of(namespace, name),
  );
}

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
}

function isUniversal(value: unknown): value is Universal {
  return value instanceof Universal;
}

/**
 * {@link https://drafts.csswg.org/selectors/#typedef-type-selector}
 */
const parseUniversal = map(
  left(option(parseNamespace), Token.parseDelim("*")),
  (namespace) => Universal.of(namespace),
);

export namespace Pseudo {
  export type JSON = Class.JSON | Element.JSON;

  export abstract class Class<
    N extends string = string,
  > extends Selector<"pseudo-class"> {
    protected readonly _name: N;

    protected constructor(name: N) {
      super("pseudo-class");
      this._name = name;
    }

    public get name(): N {
      return this._name;
    }

    public matches(element: dom.Element, context?: Context): boolean {
      return false;
    }

    public equals(value: Class): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Class && value._name === this._name;
    }

    public *[Symbol.iterator](): Iterator<Class> {
      yield this;
    }

    public toJSON(): Class.JSON<N> {
      return {
        ...super.toJSON(),
        name: this._name,
      };
    }

    public toString(): string {
      return `:${this._name}`;
    }
  }

  export namespace Class {
    export interface JSON<N extends string = string>
      extends Selector.JSON<"pseudo-class"> {
      name: N;
    }
  }

  export function isClass(value: unknown): value is Class {
    return value instanceof Class;
  }

  export abstract class Element<
    N extends string = string,
  > extends Selector<"pseudo-element"> {
    protected readonly _name: N;

    protected constructor(name: N) {
      super("pseudo-element");
      this._name = name;
    }

    public get name(): N {
      return this._name;
    }

    public matches(element: dom.Element, context?: Context): boolean {
      return false;
    }

    public equals(value: Element): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Element && value._name === this._name;
    }

    public *[Symbol.iterator](): Iterator<Element> {
      yield this;
    }

    public toJSON(): Element.JSON<N> {
      return {
        ...super.toJSON(),
        name: this._name,
      };
    }

    public toString(): string {
      return `::${this._name}`;
    }
  }

  export namespace Element {
    export interface JSON<N extends string = string>
      extends Selector.JSON<"pseudo-element"> {
      name: N;
    }
  }

  export function isElement(value: unknown): value is Element {
    return value instanceof Element;
  }
}

export type Pseudo = Pseudo.Class | Pseudo.Element;

export const { isClass: isPseudoClass, isElement: isPseudoElement } = Pseudo;

export function isPseudo(value: unknown): value is Pseudo {
  return isPseudoClass(value) || isPseudoElement(value);
}

const parseNth = left(
  Nth.parse,
  end((token) => `Unexpected token ${token}`),
);

function parsePseudoClass(
  parseSelector: () => CSSParser<
    Simple | Compound | Complex | List<Simple | Compound | Complex>
  >,
): CSSParser<Pseudo.Class> {
  return right(
    Token.parseColon,
    either(
      // Non-functional pseudo-classes
      mapResult(Token.parseIdent(), (ident) => {
        switch (ident.value) {
          case "hover":
            return Result.of<Pseudo.Class, string>(Hover.of());
          case "active":
            return Result.of(Active.of());
          case "focus":
            return Result.of(Focus.of());
          case "focus-within":
            return Result.of(FocusWithin.of());
          case "focus-visible":
            return Result.of(FocusVisible.of());
          case "link":
            return Result.of(Link.of());
          case "visited":
            return Result.of(Visited.of());
          case "disabled":
            return Result.of(Disabled.of());
          case "enabled":
            return Result.of(Enabled.of());
          case "root":
            return Result.of(Root.of());
          case "host":
            return Result.of(Host.of());
          case "empty":
            return Result.of(Empty.of());
          case "first-child":
            return Result.of(FirstChild.of());
          case "last-child":
            return Result.of(LastChild.of());
          case "only-child":
            return Result.of(OnlyChild.of());
          case "first-of-type":
            return Result.of(FirstOfType.of());
          case "last-of-type":
            return Result.of(LastOfType.of());
          case "only-of-type":
            return Result.of(OnlyOfType.of());
        }

        return Err.of(`Unknown pseudo-class :${ident.value}`);
      }),

      // Funtional pseudo-classes
      mapResult(right(peek(Token.parseFunction()), Function.consume), (fn) => {
        const { name } = fn;
        const tokens = Slice.of(fn.value);

        switch (name) {
          // :<name>(<selector-list>)
          // :has() normally only accepts relative selectors, we currently
          // accept all.
          case "is":
          case "not":
          case "has":
            return parseSelector()(tokens).map(([, selector]) => {
              switch (name) {
                case "is":
                  return Is.of(selector) as Pseudo.Class;
                case "not":
                  return Not.of(selector);
                case "has":
                  return Has.of(selector);
              }
            });

          // :<name>(<an+b>)
          case "nth-child":
          case "nth-last-child":
          case "nth-of-type":
          case "nth-last-of-type":
            return parseNth(tokens).map(([, nth]) => {
              switch (name) {
                case "nth-child":
                  return NthChild.of(nth);
                case "nth-last-child":
                  return NthLastChild.of(nth);
                case "nth-of-type":
                  return NthOfType.of(nth);
                case "nth-last-of-type":
                  return NthLastOfType.of(nth);
              }
            });
        }

        return Err.of(`Unknown pseudo-class :${fn.name}()`);
      }),
    ),
  );
}

function parsePseudoElement(
  parseSelector: () => CSSParser<
    Simple | Compound | Complex | List<Simple | Compound | Complex>
  >,
): CSSParser<Pseudo.Element> {
  return either(
    // Functional pseudo-elements need to be first because ::cue and
    // ::cue-region can be both functional and non-functional, so we want to
    // fail them as functional before testing them as non-functional.
    right(
      take(Token.parseColon, 2),
      mapResult(right(peek(Token.parseFunction()), Function.consume), (fn) => {
        const { name } = fn;
        const tokens = Slice.of(fn.value);

        switch (name) {
          case "cue":
          case "cue-region":
            return parseSelector()(tokens).map(([, selector]) =>
              name === "cue"
                ? (Cue.of(selector) as Pseudo.Element)
                : CueRegion.of(selector),
            );

          case "part":
            return separatedList(
              Token.parseIdent(),
              Token.parseWhitespace,
            )(tokens).map(([, idents]) => Part.of(idents));

          case "slotted":
            return separatedList(
              Compound.parseCompound(parseSelector),
              Token.parseWhitespace,
            )(tokens).map(([, selectors]) => Slotted.of(selectors));
        }

        return Err.of(`Unknown pseudo-element ::${name}()`);
      }),
    ),
    // Non-functional pseudo-elements
    flatMap(
      map(takeBetween(Token.parseColon, 1, 2), (colons) => colons.length),
      (colons) =>
        mapResult(Token.parseIdent(), (ident) => {
          if (colons === 1) {
            switch (ident.value) {
              // Legacy pseudo-elements must be accepted with both a single and
              // double colon.
              case "after":
              case "before":
              case "first-letter":
              case "first-line":
                break;

              default:
                return Err.of(
                  `This pseudo-element is not allowed with single colon: ::${ident.value}`,
                );
            }
          }

          switch (ident.value) {
            case "after":
              return Result.of(After.of() as Pseudo.Element);
            case "backdrop":
              return Result.of(Backdrop.of());
            case "before":
              return Result.of(Before.of());
            case "cue":
              return Result.of(Cue.of());
            case "cue-region":
              return Result.of(CueRegion.of());
            case "file-selector-button":
              return Result.of(FileSelectorButton.of());
            case "first-letter":
              return Result.of(FirstLetter.of());
            case "first-line":
              return Result.of(FirstLine.of());
            case "grammar-error":
              return Result.of(GrammarError.of());
            case "marker":
              return Result.of(Marker.of());
            case "placeholder":
              return Result.of(Placeholder.of());
            case "selection":
              return Result.of(Selection.of());
            case "spelling-error":
              return Result.of(SpellingError.of());
            case "target-text":
              return Result.of(TargetText.of());
          }

          return Err.of(`Unknown pseudo-element ::${ident.value}`);
        }),
    ),
  );
}

const parsePseudo = (
  parseSelector: () => CSSParser<
    Simple | Compound | Complex | List<Simple | Compound | Complex>
  >,
) => either(parsePseudoClass(parseSelector), parsePseudoElement(parseSelector));

/**
 * {@link https://drafts.csswg.org/selectors/#matches-pseudo}
 */
export class Is extends Pseudo.Class<"is"> {
  public static of(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ): Is {
    return new Is(selector);
  }

  private readonly _selector:
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex>;

  private constructor(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ) {
    super("is");
    this._selector = selector;
  }

  public get selector():
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex> {
    return this._selector;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._selector.matches(element, context);
  }

  public equals(value: Is): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Is && value._selector.equals(this._selector);
  }

  public toJSON(): Is.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Is {
  export interface JSON extends Pseudo.Class.JSON<"is"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#negation-pseudo}
 */
export class Not extends Pseudo.Class<"not"> {
  public static of(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ): Not {
    return new Not(selector);
  }

  private readonly _selector:
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex>;

  private constructor(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ) {
    super("not");
    this._selector = selector;
  }

  public get selector():
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex> {
    return this._selector;
  }

  public matches(element: Element, context?: Context): boolean {
    return !this._selector.matches(element, context);
  }

  public equals(value: Not): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Not && value._selector.equals(this._selector);
  }

  public toJSON(): Not.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Not {
  export interface JSON extends Pseudo.Class.JSON<"not"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends Pseudo.Class<"has"> {
  public static of(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ): Has {
    return new Has(selector);
  }

  private readonly _selector:
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex>;

  private constructor(
    selector: Simple | Compound | Complex | List<Simple | Compound | Complex>,
  ) {
    super("has");
    this._selector = selector;
  }

  public get selector():
    | Simple
    | Compound
    | Complex
    | List<Simple | Compound | Complex> {
    return this._selector;
  }

  public equals(value: Has): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Has && value._selector.equals(this._selector);
  }

  public toJSON(): Has.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

export namespace Has {
  export interface JSON extends Pseudo.Class.JSON<"has"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#hover-pseudo}
 */
export class Hover extends Pseudo.Class<"hover"> {
  public static of(): Hover {
    return new Hover();
  }

  private constructor() {
    super("hover");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return Hover._cache.get(element, Cache.empty).get(context, () => {
      // We assume that most of the time the context is near empty and thus it
      // is inexpensive to check if something is in it.
      const hovered = Sequence.from<Node>(context.withState(State.Hover));

      return (
        hovered.size !== 0 &&
        element
          .inclusiveDescendants(Node.fullTree)
          .some((descendant) => hovered.includes(descendant))
      );
    });
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#active-pseudo}
 */
export class Active extends Pseudo.Class<"active"> {
  public static of(): Active {
    return new Active();
  }

  private constructor() {
    super("active");
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return context.isActive(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#focus-pseudo}
 */
export class Focus extends Pseudo.Class<"focus"> {
  public static of(): Focus {
    return new Focus();
  }

  private constructor() {
    super("focus");
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return context.isFocused(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#focus-within-pseudo}
 */
export class FocusWithin extends Pseudo.Class<"focus-within"> {
  public static of(): FocusWithin {
    return new FocusWithin();
  }

  private constructor() {
    super("focus-within");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return FocusWithin._cache.get(element, Cache.empty).get(context, () => {
      // We assume that most of the time the context is near empty and thus it
      // is inexpensive to check if something is in it.
      const focused = Sequence.from<Node>(context.withState(State.Focus));

      return (
        focused.size !== 0 &&
        element
          .inclusiveDescendants(Node.fullTree)
          .some((descendant) => focused.includes(descendant))
      );
    });
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#the-focus-visible-pseudo}
 */
export class FocusVisible extends Pseudo.Class<"focus-visible"> {
  public static of(): FocusVisible {
    return new FocusVisible();
  }

  private constructor() {
    super("focus-visible");
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    // :focus-visible matches elements that are focused and where UA decides
    // focus should be shown. That is notably text fields and keyboard-focused
    // elements (some UA don't show focus indicator on mouse-focused elements)
    // For the purposes of accessibility testing, we currently assume that
    // we always want to look at a mode where the focus is visible. This is
    // notably due to the fact that it is a UA decision, and therefore not
    // a problem for the authors to fix if done incorrectly.
    return context.isFocused(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#link-pseudo}
 */
export class Link extends Pseudo.Class<"link"> {
  public static of(): Link {
    return new Link();
  }

  private constructor() {
    super("link");
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    switch (element.name) {
      case "a":
      case "area":
      case "link":
        return element
          .attribute("href")
          .some(() => !context.hasState(element, Context.State.Visited));
    }

    return false;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#visited-pseudo}
 */
export class Visited extends Pseudo.Class<"visited"> {
  public static of(): Visited {
    return new Visited();
  }

  private constructor() {
    super("visited");
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    switch (element.name) {
      case "a":
      case "area":
      case "link":
        return element
          .attribute("href")
          .some(() => context.hasState(element, Context.State.Visited));
    }

    return false;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#enableddisabled}
 * {@link https://html.spec.whatwg.org/multipage#selector-disabled}
 */
export class Disabled extends Pseudo.Class<"disabled"> {
  public static of(): Disabled {
    return new Disabled();
  }

  private constructor() {
    super("disabled");
  }

  public matches(
    element: dom.Element,
    context: Context = Context.empty(),
  ): boolean {
    return Element.isActuallyDisabled(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#enableddisabled}
 * {@link https://html.spec.whatwg.org/multipage#selector-enabled}
 */
export class Enabled extends Pseudo.Class<"enabled"> {
  public static of(): Enabled {
    return new Enabled();
  }

  private constructor() {
    super("enabled");
  }

  public matches(
    element: dom.Element,
    context: Context = Context.empty(),
  ): boolean {
    return test(
      and(
        hasName(
          "button",
          "input",
          "select",
          "textarea",
          "optgroup",
          "option",
          "fieldset",
        ),
        not(Element.isActuallyDisabled),
      ),
      element,
    );
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#root-pseudo}
 */
export class Root extends Pseudo.Class<"root"> {
  public static of(): Root {
    return new Root();
  }

  private constructor() {
    super("root");
  }

  public matches(element: Element): boolean {
    // The root element is the element whose parent is NOT itself an element.
    return element.parent().every(not(isElement));
  }
}

/**
 * {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 */
export class Host extends Pseudo.Class<"host"> {
  public static of(): Host {
    return new Host();
  }

  private constructor() {
    super("host");
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#empty-pseudo}
 */
export class Empty extends Pseudo.Class<"empty"> {
  public static of(): Empty {
    return new Empty();
  }

  private constructor() {
    super("empty");
  }

  public matches(element: Element): boolean {
    return element.children().isEmpty();
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends Pseudo.Class<"nth-child"> {
  public static of(index: Nth): NthChild {
    return new NthChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-child");

    this._index = index;
  }

  public matches(element: Element): boolean {
    const indices = NthChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthChild): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthChild && value._index.equals(this._index);
  }

  public toJSON(): NthChild.JSON {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthChild {
  export interface JSON extends Pseudo.Class.JSON<"nth-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends Pseudo.Class<"nth-last-child"> {
  public static of(index: Nth): NthLastChild {
    return new NthLastChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(nth: Nth) {
    super("nth-last-child");

    this._index = nth;
  }

  public matches(element: Element): boolean {
    const indices = NthLastChild._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .reverse()
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthLastChild): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthLastChild && value._index.equals(this._index);
  }

  public toJSON(): NthLastChild.JSON {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthLastChild {
  export interface JSON extends Pseudo.Class.JSON<"nth-last-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-child-pseudo}
 */
export class FirstChild extends Pseudo.Class<"first-child"> {
  public static of(): FirstChild {
    return new FirstChild();
  }

  private constructor() {
    super("first-child");
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .first()
      .includes(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#last-child-pseudo}
 */
export class LastChild extends Pseudo.Class<"last-child"> {
  public static of(): LastChild {
    return new LastChild();
  }

  private constructor() {
    super("last-child");
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .last()
      .includes(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#only-child-pseudo}
 */
export class OnlyChild extends Pseudo.Class<"only-child"> {
  public static of(): OnlyChild {
    return new OnlyChild();
  }

  private constructor() {
    super("only-child");
  }

  public matches(element: Element): boolean {
    return element.inclusiveSiblings().filter(isElement).size === 1;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-of-type-pseudo}
 */
export class NthOfType extends Pseudo.Class<"nth-of-type"> {
  public static of(index: Nth): NthOfType {
    return new NthOfType(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-of-type");

    this._index = index;
  }

  public matches(element: Element): boolean {
    const indices = NthOfType._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name))
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthOfType): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthOfType && value._index.equals(this._index);
  }

  public toJSON(): NthOfType.JSON {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthOfType {
  export interface JSON extends Pseudo.Class.JSON<"nth-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo}
 */
export class NthLastOfType extends Pseudo.Class<"nth-last-of-type"> {
  public static of(index: Nth): NthLastOfType {
    return new NthLastOfType(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-last-of-type");

    this._index = index;
  }

  public matches(element: Element): boolean {
    const indices = NthLastOfType._indices;

    if (!indices.has(element)) {
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name))
        .reverse()
        .forEach((element, i) => {
          indices.set(element, i + 1);
        });
    }

    return this._index.matches(indices.get(element)!);
  }

  public equals(value: NthLastOfType): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof NthLastOfType && value._index.equals(this._index);
  }

  public toJSON(): NthLastOfType.JSON {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

export namespace NthLastOfType {
  export interface JSON extends Pseudo.Class.JSON<"nth-last-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-of-type-pseudo}
 */
export class FirstOfType extends Pseudo.Class<"first-of-type"> {
  public static of(): FirstOfType {
    return new FirstOfType();
  }

  private constructor() {
    super("first-of-type");
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .filter(hasName(element.name))
      .first()
      .includes(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#last-of-type-pseudo}
 */
export class LastOfType extends Pseudo.Class<"last-of-type"> {
  public static of(): LastOfType {
    return new LastOfType();
  }

  private constructor() {
    super("last-of-type");
  }

  public matches(element: Element): boolean {
    return element
      .inclusiveSiblings()
      .filter(isElement)
      .filter(hasName(element.name))
      .last()
      .includes(element);
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#only-of-type-pseudo}
 */
export class OnlyOfType extends Pseudo.Class<"only-of-type"> {
  public static of(): OnlyOfType {
    return new OnlyOfType();
  }

  private constructor() {
    super("only-of-type");
  }

  public matches(element: Element): boolean {
    return (
      element
        .inclusiveSiblings()
        .filter(isElement)
        .filter(hasName(element.name)).size === 1
    );
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-after}
 */
export class After extends Pseudo.Element<"after"> {
  public static of(): After {
    return new After();
  }

  private constructor() {
    super("after");
  }
}

/**
 * {@link https://fullscreen.spec.whatwg.org/#::backdrop-pseudo-element}
 */
export class Backdrop extends Pseudo.Element<"backdrop"> {
  public static of(): Backdrop {
    return new Backdrop();
  }

  private constructor() {
    super("backdrop");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo/#selectordef-before}
 */
export class Before extends Pseudo.Element<"before"> {
  public static of(): Before {
    return new Before();
  }

  private constructor() {
    super("before");
  }
}

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-pseudo-element}
 */
class Cue extends Pseudo.Element<"cue"> {
  public static of(selector?: Selector): Cue {
    return new Cue(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
    super("cue");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public equals(value: Cue): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Cue && value.selector.equals(this.selector);
  }

  public toJSON(): Cue.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}` + this._selector.isSome()
      ? `(${this._selector})`
      : "";
  }
}

export namespace Cue {
  export interface JSON extends Pseudo.Element.JSON<"cue"> {
    selector: Option.JSON<Selector>;
  }
}

/**
 * {@link https://w3c.github.io/webvtt/#the-cue-region-pseudo-element}
 */
class CueRegion extends Pseudo.Element<"cue-region"> {
  public static of(selector?: Selector): CueRegion {
    return new CueRegion(Option.from(selector));
  }

  private readonly _selector: Option<Selector>;

  private constructor(selector: Option<Selector>) {
    super("cue-region");
    this._selector = selector;
  }

  public get selector(): Option<Selector> {
    return this._selector;
  }

  public equals(value: CueRegion): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof CueRegion && value.selector.equals(this.selector);
  }

  public toJSON(): CueRegion.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `::${this.name}` + this._selector.isSome()
      ? `(${this._selector})`
      : "";
  }
}

export namespace CueRegion {
  export interface JSON extends Pseudo.Element.JSON<"cue-region"> {
    selector: Option.JSON<Selector>;
  }
}

/**
 *{@link https://drafts.csswg.org/css-pseudo-4/#file-selector-button-pseudo}
 */
export class FileSelectorButton extends Pseudo.Element<"file-selector-button"> {
  public static of(): FileSelectorButton {
    return new FileSelectorButton();
  }

  private constructor() {
    super("file-selector-button");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-letter-pseudo}
 */
export class FirstLetter extends Pseudo.Element<"first-letter"> {
  public static of(): FirstLetter {
    return new FirstLetter();
  }

  private constructor() {
    super("first-letter");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#first-line-pseudo}
 */
export class FirstLine extends Pseudo.Element<"first-line"> {
  public static of(): FirstLine {
    return new FirstLine();
  }

  private constructor() {
    super("first-line");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-grammar-error}
 */
export class GrammarError extends Pseudo.Element<"grammar-error"> {
  public static of(): GrammarError {
    return new GrammarError();
  }

  private constructor() {
    super("grammar-error");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#marker-pseudo}
 */
export class Marker extends Pseudo.Element<"marker"> {
  public static of(): Marker {
    return new Marker();
  }

  private constructor() {
    super("marker");
  }
}

/**
 * {@link https://drafts.csswg.org/css-shadow-parts-1/#part}
 */
export class Part extends Pseudo.Element<"part"> {
  public static of(idents: Iterable<Token.Ident>): Part {
    return new Part(Array.from(idents));
  }

  private readonly _idents: ReadonlyArray<Token.Ident>;

  private constructor(idents: Array<Token.Ident>) {
    super("part");
    this._idents = idents;
  }

  public get idents(): Iterable<Token.Ident> {
    return this._idents;
  }

  public equals(value: Part): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Part && Array.equals(value._idents, this._idents);
  }

  public toJSON(): Part.JSON {
    return {
      ...super.toJSON(),
      idents: Array.toJSON(this._idents),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._idents})`;
  }
}

export namespace Part {
  export interface JSON extends Pseudo.Element.JSON<"part"> {
    idents: Array<Token.Ident.JSON>;
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#placeholder-pseudo}
 */
export class Placeholder extends Pseudo.Element<"placeholder"> {
  public static of(): Placeholder {
    return new Placeholder();
  }

  private constructor() {
    super("placeholder");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-selection}
 */
export class Selection extends Pseudo.Element<"selection"> {
  public static of(): Selection {
    return new Selection();
  }

  private constructor() {
    super("selection");
  }
}

/**
 * {@link https://drafts.csswg.org/css-scoping/#slotted-pseudo}
 */
export class Slotted extends Pseudo.Element<"slotted"> {
  public static of(selectors: Iterable<Simple | Compound>): Slotted {
    return new Slotted(Array.from(selectors));
  }

  private readonly _selectors: ReadonlyArray<Simple | Compound>;

  private constructor(selectors: Array<Simple | Compound>) {
    super("slotted");
    this._selectors = selectors;
  }

  public get selectors(): Iterable<Simple | Compound> {
    return this._selectors;
  }

  public equals(value: Slotted): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Slotted &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public toJSON(): Slotted.JSON {
    return {
      ...super.toJSON(),
      selectors: Array.toJSON(this._selectors),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._selectors})`;
  }
}

export namespace Slotted {
  export interface JSON extends Pseudo.Element.JSON<"slotted"> {
    selectors: Array<Simple.JSON | Compound.JSON>;
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-spelling-error}
 */
export class SpellingError extends Pseudo.Element<"spelling-error"> {
  public static of(): SpellingError {
    return new SpellingError();
  }

  private constructor() {
    super("spelling-error");
  }
}

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#selectordef-target-text}
 */
export class TargetText extends Pseudo.Element<"target-text"> {
  public static of(): TargetText {
    return new TargetText();
  }

  private constructor() {
    super("target-text");
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#simple}
 */
export type Simple = Type | Universal | Attribute | Class | Id | Pseudo;

export namespace Simple {
  export type JSON =
    | Type.JSON
    | Universal.JSON
    | Attribute.JSON
    | Class.JSON
    | Id.JSON
    | Pseudo.JSON;

  export function isSimple(value: unknown): value is Simple {
    return (
      Type.isType(value) ||
      isUniversal(value) ||
      Attribute.isAttribute(value) ||
      Class.isClass(value) ||
      Id.isId(value) ||
      isPseudo(value)
    );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-simple-selector}
   *
   * @internal
   */
  export const parseSimple = (
    parseSelector: () => CSSParser<
      Simple | Compound | Complex | List<Simple | Compound | Complex>
    >,
  ) =>
    either<Slice<Token>, Simple, string>(
      Class.parseClass,
      Type.parseType,
      Attribute.parseAttribute,
      Id.parseId,
      parseUniversal,
      parsePseudo(parseSelector),
    );
}
