import { Lexer, Token, Function, Nth } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as dom from "@siteimprove/alfa-dom";
import * as json from "@siteimprove/alfa-json";

import { Context } from "./context";

const {
  map,
  flatMap,
  either,
  zeroOrMore,
  oneOrMore,
  left,
  right,
  pair,
  take,
  peek,
  delimited,
  option,
  eof,
} = Parser;

const { and, not, property, equals } = Predicate;
const { isString } = Refinement;
const { isElement, hasName } = Element;

/**
 * @see https://drafts.csswg.org/selectors/#selector
 */
export type Selector =
  | Selector.Simple
  | Selector.Compound
  | Selector.Complex
  | Selector.Relative
  | Selector.List;

export namespace Selector {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  abstract class Selector
    implements
      Iterable<Simple | Compound | Complex | Relative>,
      Equatable,
      Serializable {
    /**
     * @see https://drafts.csswg.org/selectors/#match
     */
    public abstract matches(element: Element, context?: Context): boolean;

    public abstract equals(value: unknown): value is this;

    public abstract [Symbol.iterator](): Iterator<
      Simple | Compound | Complex | Relative
    >;

    public abstract toJSON(): JSON;
  }

  /**
   * @remarks
   * The selector parser is forward-declared as it is needed within its
   * subparsers.
   */
  let parseSelector: Parser<
    Slice<Token>,
    Simple | Compound | Complex | List<Simple | Compound | Complex>,
    string
  >;

  /**
   * @see https://drafts.csswg.org/selectors/#id-selector
   */
  export class Id extends Selector {
    public static of(name: string): Id {
      return new Id(name);
    }

    private readonly _name: string;

    private constructor(name: string) {
      super();
      this._name = name;
    }

    public get name(): string {
      return this._name;
    }

    public matches(element: Element): boolean {
      return element.id.includes(this._name);
    }

    public equals(value: unknown): value is this {
      return value instanceof Id && value._name === this._name;
    }

    public *[Symbol.iterator](): Iterator<Id> {
      yield this;
    }

    public toJSON(): Id.JSON {
      return {
        type: "id",
        name: this._name,
      };
    }

    public toString(): string {
      return `#${this._name}`;
    }
  }

  export namespace Id {
    export interface JSON extends Selector.JSON {
      type: "id";
      name: string;
    }
  }

  export function isId(value: unknown): value is Id {
    return value instanceof Id;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-id-selector
   */
  const parseId = map(
    Token.parseHash((hash) => hash.isIdentifier),
    (hash) => Id.of(hash.value)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#class-selector
   */
  export class Class extends Selector {
    public static of(name: string): Class {
      return new Class(name);
    }

    private readonly _name: string;

    private constructor(name: string) {
      super();
      this._name = name;
    }

    public get name(): string {
      return this._name;
    }

    public matches(element: Element): boolean {
      return Iterable.includes(element.classes, this._name);
    }

    public equals(value: unknown): value is this {
      return value instanceof Class && value._name === this._name;
    }

    public *[Symbol.iterator](): Iterator<Class> {
      yield this;
    }

    public toJSON(): Class.JSON {
      return {
        type: "class",
        name: this._name,
      };
    }

    public toString(): string {
      return `.${this._name}`;
    }
  }

  export namespace Class {
    export interface JSON extends Selector.JSON {
      type: "class";
      name: string;
    }
  }

  export function isClass(value: unknown): value is Class {
    return value instanceof Class;
  }

  const parseClass = map(
    right(Token.parseDelim("."), Token.parseIdent()),
    (ident) => Class.of(ident.value)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-ns-prefix
   */
  const parseNamespace = map(
    left(
      option(either(Token.parseIdent(), Token.parseDelim("*"))),
      Token.parseDelim("|")
    ),
    (token) => token.map((token) => token.toString()).getOr("")
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-wq-name
   */
  const parseName = pair(
    option(parseNamespace),
    map(Token.parseIdent(), (ident) => ident.value)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#attribute-selector
   */
  export class Attribute extends Selector {
    public static of(
      namespace: Option<string>,
      name: string,
      value: Option<string> = None,
      matcher: Option<Attribute.Matcher> = None,
      modifier: Option<Attribute.Modifier> = None
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
      modifier: Option<Attribute.Modifier>
    ) {
      super();
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
              property("namespace", equals(None))
            );
            break;

          default:
            predicate = and(
              property("name", equals(this._name)),
              property("namespace", equals(namespace))
            );
        }

        return Iterable.some(
          element.attributes,
          and(predicate, (attribute) => this.matchesValue(attribute.value))
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

    public equals(value: unknown): value is this {
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
        type: "attribute",
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
        .get();

      const matcher = this._matcher.getOr("");

      const modifier = this._modifier
        .map((modifier) => ` ${modifier}`)
        .getOr("");

      return `[${namespace}${this._name}${matcher}${value}${modifier}]`;
    }
  }

  export namespace Attribute {
    export interface JSON extends Selector.JSON {
      type: "attribute";
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
  }

  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-attr-matcher
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
              either(Token.parseDelim("$"), Token.parseDelim("*"))
            )
          )
        )
      ),
      Token.parseDelim("=")
    ),
    (delim) =>
      delim.isNone()
        ? Attribute.Matcher.Equal
        : (`${delim.get()}=` as Attribute.Matcher)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-attr-modifier
   */
  const parseModifier = either(
    map(Token.parseIdent("i"), () => Attribute.Modifier.CaseInsensitive),
    map(Token.parseIdent("s"), () => Attribute.Modifier.CaseSensitive)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-attribute-selector
   */
  const parseAttribute = map(
    delimited(
      Token.parseOpenSquareBracket,
      pair(
        parseName,
        option(
          pair(
            pair(parseMatcher, either(Token.parseString(), Token.parseIdent())),
            delimited(option(Token.parseWhitespace), option(parseModifier))
          )
        )
      ),
      Token.parseCloseSquareBracket
    ),
    (result) => {
      const [[namespace, name], rest] = result;

      if (rest.isNone()) {
        return Attribute.of(namespace, name);
      }

      const [[matcher, value], modifier] = rest.get();

      return Attribute.of(
        namespace,
        name,
        Option.of(value.value),
        Option.of(matcher),
        modifier
      );
    }
  );

  /**
   * @see https://drafts.csswg.org/selectors/#type-selector
   */
  export class Type extends Selector {
    public static of(namespace: Option<string>, name: string): Type {
      return new Type(namespace, name);
    }

    private readonly _namespace: Option<string>;
    private readonly _name: string;

    private constructor(namespace: Option<string>, name: string) {
      super();
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

    public equals(value: unknown): value is this {
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
        type: "type",
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
    export interface JSON extends Selector.JSON {
      type: "type";
      namespace: string | null;
      name: string;
    }
  }

  export function isType(value: unknown): value is Type {
    return value instanceof Type;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-type-selector
   */
  const parseType = map(parseName, ([namespace, name]) =>
    Type.of(namespace, name)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#universal-selector
   */
  export class Universal extends Selector {
    public static of(namespace: Option<string>): Universal {
      return new Universal(namespace);
    }

    private static readonly _empty = new Universal(None);

    public static empty(): Universal {
      return this._empty;
    }

    private readonly _namespace: Option<string>;

    private constructor(namespace: Option<string>) {
      super();
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

    public equals(value: unknown): value is this {
      return (
        value instanceof Universal && value._namespace.equals(this._namespace)
      );
    }

    public *[Symbol.iterator](): Iterator<Universal> {
      yield this;
    }

    public toJSON(): Universal.JSON {
      return {
        type: "universal",
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
    export interface JSON extends Selector.JSON {
      type: "universal";
      namespace: string | null;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-type-selector
   */
  const parseUniversal = map(
    left(option(parseNamespace), Token.parseDelim("*")),
    (namespace) => Universal.of(namespace)
  );

  export namespace Pseudo {
    export type JSON = Class.JSON | Element.JSON;

    export abstract class Class extends Selector {
      protected readonly _name: string;

      protected constructor(name: string) {
        super();
        this._name = name;
      }

      public get name(): string {
        return this._name;
      }

      public matches(element: dom.Element, context?: Context): boolean {
        return false;
      }

      public equals(value: unknown): value is this {
        return value instanceof Class && value._name === this._name;
      }

      public *[Symbol.iterator](): Iterator<Class> {
        yield this;
      }

      public toJSON(): Class.JSON {
        return {
          type: "pseudo-class",
          name: this._name,
        };
      }

      public toString(): string {
        return `:${this._name}`;
      }
    }

    export namespace Class {
      export interface JSON extends Selector.JSON {
        type: "pseudo-class";
        name: string;
      }
    }

    export abstract class Element extends Selector {
      protected readonly _name: string;

      protected constructor(name: string) {
        super();
        this._name = name;
      }

      public get name(): string {
        return this._name;
      }

      public matches(element: dom.Element, context?: Context): boolean {
        return false;
      }

      public equals(value: unknown): value is this {
        return value instanceof Element && value._name === this._name;
      }

      public *[Symbol.iterator](): Iterator<Element> {
        yield this;
      }

      public toJSON(): Element.JSON {
        return {
          type: "pseudo-element",
          name: this._name,
        };
      }

      public toString(): string {
        return `::${this._name}`;
      }
    }

    export namespace Element {
      export interface JSON extends Selector.JSON {
        type: "pseudo-element";
        name: string;
      }
    }
  }

  export type Pseudo = Pseudo.Class | Pseudo.Element;

  const parseNth = left(
    Nth.parse,
    eof((token) => `Unexpected token ${token}`)
  );

  const parsePseudoClass = right(
    Token.parseColon,
    either(
      // Non-functional pseudo-classes
      flatMap(Token.parseIdent(), (ident) => (input) => {
        switch (ident.value) {
          case "hover":
            return Result.of([input, Hover.of()]);
          case "active":
            return Result.of([input, Active.of()]);
          case "focus":
            return Result.of([input, Focus.of()]);
          case "focus-within":
            return Result.of([input, FocusWithin.of()]);
          case "focus-visible":
            return Result.of([input, FocusVisible.of()]);
          case "link":
            return Result.of([input, Link.of()]);
          case "visited":
            return Result.of([input, Visited.of()]);
          case "root":
            return Result.of([input, Root.of()]);
          case "empty":
            return Result.of([input, Empty.of()]);
          case "first-child":
            return Result.of([input, FirstChild.of()]);
          case "last-child":
            return Result.of([input, LastChild.of()]);
          case "only-child":
            return Result.of([input, OnlyChild.of()]);
          case "first-of-type":
            return Result.of([input, FirstOfType.of()]);
          case "last-of-type":
            return Result.of([input, LastOfType.of()]);
          case "only-of-type":
            return Result.of([input, OnlyOfType.of()]);
        }

        return Err.of(`Unknown pseudo-class :${ident.value}`);
      }),

      // Funtional pseudo-classes
      flatMap(
        right(peek(Token.parseFunction()), Function.consume),
        (fn) => (input) => {
          const { name } = fn;
          const tokens = Slice.of(fn.value);

          switch (name) {
            // :<name>(<selector-list>)
            case "is":
            case "not":
            case "has":
              return parseSelector(tokens).map(([, selector]) => {
                switch (name) {
                  case "is":
                    // Annotate the first value to ensure correct inference.
                    return [input, Is.of(selector) as Pseudo.Class];
                  case "not":
                    return [input, Not.of(selector)];
                  case "has":
                    return [input, Has.of(selector)];
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
                    return [input, NthChild.of(nth)];
                  case "nth-last-child":
                    return [input, NthLastChild.of(nth)];
                  case "nth-of-type":
                    return [input, NthOfType.of(nth)];
                  case "nth-last-of-type":
                    return [input, NthLastOfType.of(nth)];
                }
              });
          }

          return Err.of(`Unknown pseudo-class :${fn.name}()`);
        }
      )
    )
  );

  const parsePseudoElement = right(
    take(Token.parseColon, 2),
    flatMap(Token.parseIdent(), (ident) => (input) => {
      switch (ident.value) {
        case "before":
          return Result.of([input, Before.of()]);
        case "after":
          return Result.of([input, After.of()]);
      }

      return Err.of(`Unknown pseudo-element ::${ident.value}`);
    })
  );

  const parsePseudo = either(parsePseudoClass, parsePseudoElement);

  /**
   * @see https://drafts.csswg.org/selectors/#matches-pseudo
   */
  export class Is extends Pseudo.Class {
    public static of(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
    ): Is {
      return new Is(selector);
    }

    private readonly _selector:
      | Simple
      | Compound
      | Complex
      | List<Simple | Compound | Complex>;

    private constructor(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
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

    public equals(value: unknown): value is this {
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
    export interface JSON extends Pseudo.Class.JSON {
      selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#negation-pseudo
   */
  export class Not extends Pseudo.Class {
    public static of(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
    ): Not {
      return new Not(selector);
    }

    private readonly _selector:
      | Simple
      | Compound
      | Complex
      | List<Simple | Compound | Complex>;

    private constructor(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
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

    public equals(value: unknown): value is this {
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
    export interface JSON extends Pseudo.Class.JSON {
      selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#has-pseudo
   */
  export class Has extends Pseudo.Class {
    public static of(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
    ): Has {
      return new Has(selector);
    }

    private readonly _selector:
      | Simple
      | Compound
      | Complex
      | List<Simple | Compound | Complex>;

    private constructor(
      selector: Simple | Compound | Complex | List<Simple | Compound | Complex>
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

    public equals(value: unknown): value is this {
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
    export interface JSON extends Pseudo.Class.JSON {
      selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#hover-pseudo
   */
  export class Hover extends Pseudo.Class {
    public static of(): Hover {
      return new Hover();
    }

    private constructor() {
      super("hover");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
    ): boolean {
      return context.isHovered(element);
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#active-pseudo
   */
  export class Active extends Pseudo.Class {
    public static of(): Active {
      return new Active();
    }

    private constructor() {
      super("active");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
    ): boolean {
      return context.isActive(element);
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#focus-pseudo
   */
  export class Focus extends Pseudo.Class {
    public static of(): Focus {
      return new Focus();
    }

    private constructor() {
      super("focus");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
    ): boolean {
      return context.isFocused(element);
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#focus-within-pseudo
   */
  export class FocusWithin extends Pseudo.Class {
    public static of(): FocusWithin {
      return new FocusWithin();
    }

    private constructor() {
      super("focus-within");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
    ): boolean {
      return element
        .inclusiveDescendants({ flattened: true })
        .filter(isElement)
        .some((element) => context.isFocused(element));
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#focus-visible-pseudo
   */
  export class FocusVisible extends Pseudo.Class {
    public static of(): FocusVisible {
      return new FocusVisible();
    }

    private constructor() {
      super("focus-visible");
    }

    public matches(): boolean {
      // For the purposes of accessibility testing, we currently assume that
      // focus related styling can safely be "hidden" behind the :focus-visible
      // pseudo-class and it will therefore always match.
      return true;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#link-pseudo
   */
  export class Link extends Pseudo.Class {
    public static of(): Link {
      return new Link();
    }

    private constructor() {
      super("link");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
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
   * @see https://drafts.csswg.org/selectors/#visited-pseudo
   */
  export class Visited extends Pseudo.Class {
    public static of(): Visited {
      return new Visited();
    }

    private constructor() {
      super("visited");
    }

    public matches(
      element: Element,
      context: Context = Context.empty()
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
   * @see https://drafts.csswg.org/selectors/#root-pseudo
   */
  export class Root extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#empty-pseudo
   */
  export class Empty extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#nth-child-pseudo
   */
  export class NthChild extends Pseudo.Class {
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

    public toJSON(): NthChild.JSON {
      return {
        ...super.toJSON(),
        index: this._index.toJSON(),
      };
    }
  }

  export namespace NthChild {
    export interface JSON extends Pseudo.Class.JSON {
      index: Nth.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#nth-last-child-pseudo
   */
  export class NthLastChild extends Pseudo.Class {
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

    public toJSON(): NthLastChild.JSON {
      return {
        ...super.toJSON(),
        index: this._index.toJSON(),
      };
    }
  }

  export namespace NthLastChild {
    export interface JSON extends Pseudo.Class.JSON {
      index: Nth.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#first-child-pseudo
   */
  export class FirstChild extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#last-child-pseudo
   */
  export class LastChild extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#only-child-pseudo
   */
  export class OnlyChild extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#nth-of-type-pseudo
   */
  export class NthOfType extends Pseudo.Class {
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

    public toJSON(): NthOfType.JSON {
      return {
        ...super.toJSON(),
        index: this._index.toJSON(),
      };
    }
  }

  export namespace NthOfType {
    export interface JSON extends Pseudo.Class.JSON {
      index: Nth.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo
   */
  export class NthLastOfType extends Pseudo.Class {
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

    public toJSON(): NthLastOfType.JSON {
      return {
        ...super.toJSON(),
        index: this._index.toJSON(),
      };
    }
  }

  export namespace NthLastOfType {
    export interface JSON extends Pseudo.Class.JSON {
      index: Nth.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#first-of-type-pseudo
   */
  export class FirstOfType extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#last-of-type-pseudo
   */
  export class LastOfType extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/selectors/#only-of-type-pseudo
   */
  export class OnlyOfType extends Pseudo.Class {
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
   * @see https://drafts.csswg.org/css-pseudo/#selectordef-before
   */
  export class Before extends Pseudo.Element {
    public static of(): Before {
      return new Before();
    }

    private constructor() {
      super("before");
    }
  }

  /**
   * @see https://drafts.csswg.org/css-pseudo/#selectordef-after
   */
  export class After extends Pseudo.Element {
    public static of(): After {
      return new After();
    }

    private constructor() {
      super("after");
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#simple
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
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-simple-selector
   */
  const parseSimple = either(
    parseClass,
    either(
      parseType,
      either(
        parseAttribute,
        either(parseId, either(parseUniversal, parsePseudo))
      )
    )
  );

  /**
   * @see https://drafts.csswg.org/selectors/#compound
   */
  export class Compound extends Selector {
    public static of(left: Simple, right: Simple | Compound): Compound {
      return new Compound(left, right);
    }

    private readonly _left: Simple;
    private readonly _right: Simple | Compound;

    private constructor(left: Simple, right: Simple | Compound) {
      super();
      this._left = left;
      this._right = right;
    }

    public get left(): Simple {
      return this._left;
    }

    public get right(): Simple | Compound {
      return this._right;
    }

    public matches(element: Element, context?: Context): boolean {
      return (
        this._left.matches(element, context) &&
        this._right.matches(element, context)
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Compound &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public *[Symbol.iterator](): Iterator<Compound> {
      yield this;
    }

    public toJSON(): Compound.JSON {
      return {
        type: "compound",
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `${this._left}${this._right}`;
    }
  }

  export namespace Compound {
    export interface JSON extends Selector.JSON {
      type: "compound";
      left: Simple.JSON;
      right: Simple.JSON | JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-compound-selector
   */
  const parseCompound = map(oneOrMore(parseSimple), (result) => {
    const [left, ...selectors] = Iterable.reverse(result);

    return Iterable.reduce(
      selectors,
      (right, left) => Compound.of(left, right),
      left as Simple | Compound
    );
  });

  /**
   * @see https://drafts.csswg.org/selectors/#selector-combinator
   */
  export enum Combinator {
    /**
     * @example div span
     */
    Descendant = " ",

    /**
     * @example div > span
     */
    DirectDescendant = ">",

    /**
     * @example div ~ span
     */
    Sibling = "~",

    /**
     * @example div + span
     */
    DirectSibling = "+",
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-combinator
   */
  const parseCombinator = either(
    delimited(
      option(Token.parseWhitespace),
      either(
        map(Token.parseDelim(">"), () => Combinator.DirectDescendant),
        either(
          map(Token.parseDelim("~"), () => Combinator.Sibling),
          map(Token.parseDelim("+"), () => Combinator.DirectSibling)
        )
      )
    ),
    map(Token.parseWhitespace, () => Combinator.Descendant)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#complex
   */
  export class Complex extends Selector {
    public static of(
      combinator: Combinator,
      left: Simple | Compound | Complex,
      right: Simple | Compound
    ): Complex {
      return new Complex(combinator, left, right);
    }

    private readonly _combinator: Combinator;
    private readonly _left: Simple | Compound | Complex;
    private readonly _right: Simple | Compound;

    private constructor(
      combinator: Combinator,
      left: Simple | Compound | Complex,
      right: Simple | Compound
    ) {
      super();
      this._combinator = combinator;
      this._left = left;
      this._right = right;
    }

    public get combinator(): Combinator {
      return this._combinator;
    }

    public get left(): Simple | Compound | Complex {
      return this._left;
    }

    public get right(): Simple | Compound {
      return this._right;
    }

    public matches(element: Element, context?: Context): boolean {
      // First, make sure that the right side of the selector, i.e. the part
      // that relates to the current element, matches.
      if (this._right.matches(element, context)) {
        // If it does, move on to the heavy part of the work: Looking either up
        // the tree for a descendant match or looking to the side of the tree
        // for a sibling match.
        switch (this._combinator) {
          case Combinator.Descendant:
            return element
              .ancestors()
              .filter(isElement)
              .some((element) => this._left.matches(element, context));

          case Combinator.DirectDescendant:
            return element
              .parent()
              .filter(isElement)
              .some((element) => this._left.matches(element, context));

          case Combinator.Sibling:
            return element
              .preceding()
              .filter(isElement)
              .some((element) => this._left.matches(element, context));

          case Combinator.DirectSibling:
            return element
              .preceding()
              .find(isElement)
              .some((element) => this._left.matches(element, context));
        }
      }

      return false;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Complex &&
        value._combinator === this._combinator &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public *[Symbol.iterator](): Iterator<Complex> {
      yield this;
    }

    public toJSON(): Complex.JSON {
      return {
        type: "complex",
        combinator: this._combinator,
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      const combinator =
        this._combinator === Combinator.Descendant
          ? " "
          : ` ${this._combinator} `;

      return `${this._left}${combinator}${this._right}`;
    }
  }

  export namespace Complex {
    export interface JSON extends Selector.JSON {
      type: "complex";
      combinator: string;
      left: Simple.JSON | Compound.JSON | JSON;
      right: Simple.JSON | Compound.JSON;
    }
  }

  export function isComplex(value: unknown): value is Complex {
    return value instanceof Complex;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-complex-selector
   */
  const parseComplex = map(
    pair(parseCompound, zeroOrMore(pair(parseCombinator, parseCompound))),
    (result) => {
      const [left, selectors] = result;

      return Iterable.reduce(
        selectors,
        (left, [combinator, right]) => Complex.of(combinator, left, right),
        left as Simple | Compound | Complex
      );
    }
  );

  /**
   * @see https://drafts.csswg.org/selectors/#relative-selector
   */
  export class Relative extends Selector {
    public static of(
      combinator: Combinator,
      selector: Simple | Compound | Complex
    ): Relative {
      return new Relative(combinator, selector);
    }

    private readonly _combinator: Combinator;
    private readonly _selector: Simple | Compound | Complex;

    private constructor(
      combinator: Combinator,
      selector: Simple | Compound | Complex
    ) {
      super();
      this._combinator = combinator;
      this._selector = selector;
    }

    public get combinator(): Combinator {
      return this._combinator;
    }

    public get selector(): Simple | Compound | Complex {
      return this._selector;
    }

    public matches(): boolean {
      return false;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Relative &&
        value._combinator === this._combinator &&
        value._selector.equals(this._selector)
      );
    }

    public *[Symbol.iterator](): Iterator<Relative> {
      yield this;
    }

    public toJSON(): Relative.JSON {
      return {
        type: "relative",
        combinator: this._combinator,
        selector: this._selector.toJSON(),
      };
    }

    public toString(): string {
      const combinator =
        this._combinator === Combinator.Descendant
          ? ""
          : `${this._combinator} `;

      return `${combinator}${this._selector}`;
    }
  }

  export namespace Relative {
    export interface JSON extends Selector.JSON {
      type: "relative";
      combinator: string;
      selector: Simple.JSON | Compound.JSON | Complex.JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-relative-selector
   */
  const parseRelative = map(pair(parseCombinator, parseComplex), (result) => {
    const [combinator, selector] = result;

    return Relative.of(combinator, selector);
  });

  /**
   * @see https://drafts.csswg.org/selectors/#selector-list
   */
  export class List<
    T extends Simple | Compound | Complex | Relative =
      | Simple
      | Compound
      | Complex
      | Relative
  > extends Selector {
    public static of<T extends Simple | Compound | Complex | Relative>(
      left: T,
      right: T | List<T>
    ): List<T> {
      return new List(left, right);
    }

    private readonly _left: T;
    private readonly _right: T | List<T>;

    private constructor(left: T, right: T | List<T>) {
      super();
      this._left = left;
      this._right = right;
    }

    public get left(): T {
      return this._left;
    }

    public get right(): T | List<T> {
      return this._right;
    }

    public matches(element: Element, context?: Context): boolean {
      return (
        this._left.matches(element, context) ||
        this._right.matches(element, context)
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof List &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public *[Symbol.iterator](): Iterator<
      Simple | Compound | Complex | Relative
    > {
      yield this._left;
      yield* this._right;
    }

    public toJSON(): List.JSON {
      return {
        type: "list",
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `${this._left}, ${this._right}`;
    }
  }

  export namespace List {
    export interface JSON extends Selector.JSON {
      type: "list";
      left: Simple.JSON | Compound.JSON | Complex.JSON | Relative.JSON;
      right: Simple.JSON | Compound.JSON | Complex.JSON | Relative.JSON | JSON;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-selector-list
   */
  const parseList = map(
    pair(
      parseComplex,
      zeroOrMore(
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          parseComplex
        )
      )
    ),
    (result) => {
      let [left, selectors] = result;

      [left, ...selectors] = [...Iterable.reverse(selectors), left];

      return Iterable.reduce(
        selectors,
        (right, left) => List.of(left, right),
        left as Simple | Compound | Complex | List<Simple | Compound | Complex>
      );
    }
  );

  parseSelector = left(
    parseList,
    eof((token) => `Unexpected token ${token}`)
  );

  export function parse(input: string) {
    return parseList(Slice.of(Lexer.lex(input)))
      .flatMap(([tokens, selector]) => {
        const result: Result<typeof selector, string> =
          tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token");

        return result;
      })
      .ok();
  }

  export function matches(
    selector: string | Selector,
    context?: Context
  ): Predicate<Element> {
    let parsed: Selector;

    if (isString(selector)) {
      parsed = parse(selector).getOrElse(() => Not.of(Universal.empty()));
    } else {
      parsed = selector;
    }

    return (element) => parsed.matches(element, context);
  }
}
