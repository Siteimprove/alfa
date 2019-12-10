import { Element } from "@siteimprove/alfa-dom";
import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { lex } from "./syntax/lex";
import { Token } from "./syntax/token";

const { reduce, reverse, some } = Iterable;

const {
  map,
  either,
  zeroOrMore,
  oneOrMore,
  left,
  right,
  pair,
  delimited,
  option
} = Parser;

const { and } = Predicate;

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
  abstract class Selector
    implements
      Iterable<Simple | Compound | Complex | Relative>,
      Equality<Selector> {
    /**
     * @see https://drafts.csswg.org/selectors/#match
     */
    public abstract matches(
      element: Element,
      scope?: Iterable<Element>
    ): boolean;

    public abstract equals(value: unknown): value is Selector;

    public abstract [Symbol.iterator](): Iterator<
      Simple | Compound | Complex | Relative
    >;

    public abstract toJSON(): unknown;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#id-selector
   */
  export class Id extends Selector {
    public static of(name: string): Id {
      return new Id(name);
    }

    public readonly name: string;

    private constructor(name: string) {
      super();
      this.name = name;
    }

    public matches(element: Element): boolean {
      return element.id.includes(this.name);
    }

    public equals(value: unknown): value is Id {
      return value instanceof Id && value.name === this.name;
    }

    public *[Symbol.iterator](): Iterator<Id> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "id",
        name: this.name
      };
    }

    public toString(): string {
      return `#${this.name}`;
    }
  }

  export function isId(value: unknown): value is Id {
    return value instanceof Id;
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-id-selector
   */
  const parseId = map(Token.parseHash(hash => hash.isIdentifier), hash =>
    Id.of(hash.value)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#class-selector
   */
  export class Class extends Selector {
    public static of(name: string): Class {
      return new Class(name);
    }

    public readonly name: string;

    private constructor(name: string) {
      super();
      this.name = name;
    }

    public matches(element: Element): boolean {
      return element.classes.has(this.name);
    }

    public equals(value: unknown): value is Class {
      return value instanceof Class && value.name === this.name;
    }

    public *[Symbol.iterator](): Iterator<Class> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "class",
        name: this.name
      };
    }

    public toString(): string {
      return `.${this.name}`;
    }
  }

  export function isClass(value: unknown): value is Class {
    return value instanceof Class;
  }

  const parseClass = map(
    right(Token.parseDelim("."), Token.parseIdent()),
    ident => Class.of(ident.value)
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-ns-prefix
   */
  const parseNamespace = map(
    left(
      option(either(Token.parseIdent(), Token.parseDelim("*"))),
      Token.parseDelim("|")
    ),
    token => token.map(token => token.toString()).getOr("")
  );

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-wq-name
   */
  const parseName = pair(
    option(parseNamespace),
    map(Token.parseIdent(), ident => ident.value)
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

    public readonly namespace: Option<string>;
    public readonly name: string;
    public readonly value: Option<string>;
    public readonly matcher: Option<Attribute.Matcher>;
    public readonly modifier: Option<Attribute.Modifier>;

    private constructor(
      namespace: Option<string>,
      name: string,
      value: Option<string>,
      matcher: Option<Attribute.Matcher>,
      modifier: Option<Attribute.Modifier>
    ) {
      super();
      this.namespace = namespace;
      this.name = name;
      this.value = value;
      this.matcher = matcher;
      this.modifier = modifier;
    }

    public matches(element: Element): boolean {
      return false;
    }

    public equals(value: unknown): value is Attribute {
      return (
        value instanceof Attribute &&
        value.namespace.equals(this.namespace) &&
        value.name === this.name &&
        value.value.equals(this.value) &&
        value.matcher.equals(this.matcher) &&
        value.modifier.equals(this.modifier)
      );
    }

    public *[Symbol.iterator](): Iterator<Attribute> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "attribute",
        namespace: this.namespace.getOr(null),
        name: this.name,
        value: this.value.getOr(null),
        matcher: this.matcher.getOr(null),
        modifier: this.modifier.getOr(null)
      };
    }

    public toString(): string {
      const namespace = this.namespace
        .map(namespace => `${namespace}|`)
        .getOr("");

      const value = this.value
        .map(value => `"${value.replace(/"/g, `\\"`)}"`)
        .getOr("");

      const matcher = this.matcher.getOr("");

      const modifier = this.modifier.map(modifier => ` ${modifier}`).getOr("");

      return `[${namespace}${this.name}${matcher}${value}${modifier}]`;
    }
  }

  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  export namespace Attribute {
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
      Substring = "*="
    }

    export enum Modifier {
      /**
       * @example [foo=bar i]
       */
      CaseInsensitive = "i",

      /**
       * @example [foo=Bar s]
       */
      CaseSensitive = "s"
    }
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
    delim =>
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
    result => {
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

    public readonly namespace: Option<string>;
    public readonly name: string;

    private constructor(namespace: Option<string>, name: string) {
      super();
      this.namespace = namespace;
      this.name = name;
    }

    public matches(element: Element): boolean {
      if (this.name !== element.name) {
        return false;
      }

      if (this.namespace.isNone() || this.namespace.includes("*")) {
        return true;
      }

      return element.namespace.equals(this.namespace);
    }

    public equals(value: unknown): value is Type {
      return (
        value instanceof Type &&
        value.namespace.equals(this.namespace) &&
        value.name === this.name
      );
    }

    public *[Symbol.iterator](): Iterator<Type> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "type",
        namespace: this.namespace.getOr(null),
        name: this.name
      };
    }

    public toString(): string {
      const namespace = this.namespace
        .map(namespace => `${namespace}|`)
        .getOr("");

      return `${namespace}${this.name}`;
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
    public static of(namespace: Option<string> = None): Universal {
      return new Universal(namespace);
    }

    public readonly namespace: Option<string>;

    private constructor(namespace: Option<string>) {
      super();
      this.namespace = namespace;
    }

    public matches(element: Element): boolean {
      return element.namespace.equals(this.namespace);
    }

    public equals(value: unknown): value is Universal {
      return (
        value instanceof Universal && value.namespace.equals(this.namespace)
      );
    }

    public *[Symbol.iterator](): Iterator<Universal> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "universal",
        namespace: this.namespace.getOr(null)
      };
    }

    public toString(): string {
      const namespace = this.namespace
        .map(namespace => `${namespace}|`)
        .getOr("");

      return `${namespace}*`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-type-selector
   */
  const parseUniversal = map(
    left(option(parseNamespace), Token.parseDelim("*")),
    namespace => Universal.of(namespace)
  );

  export namespace Pseudo {
    export abstract class Class extends Selector {
      public readonly name: string;

      protected constructor(name: string) {
        super();
        this.name = name;
      }

      public matches(): boolean {
        return false;
      }

      public equals(value: unknown): value is Class {
        return value instanceof Class && value.name === this.name;
      }

      public *[Symbol.iterator](): Iterator<Class> {
        yield this;
      }

      public toJSON(): unknown {
        return {
          type: "pseudo-class",
          name: this.name
        };
      }

      public toString(): string {
        return `:${this.name}`;
      }
    }

    export abstract class Element extends Selector {
      public readonly name: string;

      protected constructor(name: string) {
        super();
        this.name = name;
      }

      public matches(): boolean {
        return false;
      }

      public equals(value: unknown): value is Element {
        return value instanceof Element && value.name === this.name;
      }

      public *[Symbol.iterator](): Iterator<Element> {
        yield this;
      }

      public toJSON(): unknown {
        return {
          type: "pseudo-element",
          name: this.name
        };
      }

      public toString(): string {
        return `::${this.name}`;
      }
    }
  }

  export type Pseudo = Pseudo.Class | Pseudo.Element;

  /**
   * @see https://drafts.csswg.org/selectors/#matches-pseudo
   */
  export class Is extends Pseudo.Class {
    public readonly selector: Selector;

    private constructor(selector: Selector) {
      super("is");
      this.selector = selector;
    }

    public equals(value: unknown): value is Is {
      return value instanceof Is && value.selector.equals(this.selector);
    }

    public toJSON(): unknown {
      return {
        ...super.toJSON(),
        selector: this.selector
      };
    }

    public toString(): string {
      return `:${this.name}(${this.selector})`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#negation-pseudo
   */
  export class Not extends Pseudo.Class {
    public readonly selector: Selector;

    private constructor(selector: Selector) {
      super("not");
      this.selector = selector;
    }

    public equals(value: unknown): value is Not {
      return value instanceof Not && value.selector.equals(this.selector);
    }

    public toJSON(): unknown {
      return {
        ...super.toJSON(),
        selector: this.selector
      };
    }

    public toString(): string {
      return `:${this.name}(${this.selector})`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#has-pseudo
   */
  export class Has extends Pseudo.Class {
    public readonly selector: Selector;

    private constructor(selector: Selector) {
      super("has");
      this.selector = selector;
    }

    public equals(value: unknown): value is Has {
      return value instanceof Has && value.selector.equals(this.selector);
    }

    public toJSON(): unknown {
      return {
        ...super.toJSON(),
        selector: this.selector
      };
    }

    public toString(): string {
      return `:${this.name}(${this.selector})`;
    }
  }

  /**
   * @see https://drafts.csswg.org/css-pseudo/#selectordef-before
   */
  export class Before extends Pseudo.Element {
    private constructor() {
      super("before");
    }
  }

  /**
   * @see https://drafts.csswg.org/css-pseudo/#selectordef-after
   */
  export class After extends Pseudo.Element {
    private constructor() {
      super("after");
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#simple
   */
  export type Simple = Type | Universal | Attribute | Class | Id | Pseudo;

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-simple-selector
   */
  const parseSimple = either(
    parseClass,
    either(parseType, either(parseAttribute, either(parseId, parseUniversal)))
  );

  /**
   * @see https://drafts.csswg.org/selectors/#compound
   */
  export class Compound extends Selector {
    public static of(left: Simple, right: Simple | Compound): Compound {
      return new Compound(left, right);
    }

    public readonly left: Simple;
    public readonly right: Simple | Compound;

    private constructor(left: Simple, right: Simple | Compound) {
      super();
      this.left = left;
      this.right = right;
    }

    public matches(element: Element): boolean {
      return this.left.matches(element) && this.right.matches(element);
    }

    public equals(value: unknown): value is Compound {
      return (
        value instanceof Compound &&
        value.left.equals(this.left) &&
        value.right.equals(this.right)
      );
    }

    public *[Symbol.iterator](): Iterator<Compound> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "compound",
        left: this.left,
        right: this.right
      };
    }

    public toString(): string {
      return `${this.left}${this.right}`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-compound-selector
   */
  const parseCompound = map(oneOrMore(parseSimple), result => {
    const [left, ...selectors] = reverse(result);

    return reduce(selectors, (right, left) => Compound.of(left, right), left as
      | Simple
      | Compound);
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
    DirectSibling = "+"
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

    public readonly combinator: Combinator;
    public readonly left: Simple | Compound | Complex;
    public readonly right: Simple | Compound;

    private constructor(
      combinator: Combinator,
      left: Simple | Compound | Complex,
      right: Simple | Compound
    ) {
      super();
      this.combinator = combinator;
      this.left = left;
      this.right = right;
    }

    public matches(element: Element): boolean {
      // First, make sure that the right side of the selector, i.e. the part
      // that relates to the current element, matches.
      if (this.right.matches(element)) {
        // If it does, move on to the heavy part of the work: Looking either up
        // the tree for a descendant match or looking to the side of the tree
        // for a sibling match.
        switch (this.combinator) {
          case Combinator.Descendant:
            return some(
              element.ancestors(),
              and(Element.isElement, element => this.left.matches(element))
            );

          case Combinator.DirectDescendant:
            return element
              .parent()
              .some(
                and(Element.isElement, element => this.left.matches(element))
              );

          case Combinator.Sibling:
            return element
              .previous(
                and(Element.isElement, element => this.left.matches(element))
              )
              .isSome();

          case Combinator.DirectSibling:
            return element
              .previous(Element.isElement)
              .some(element => this.left.matches(element));
        }
      }

      return false;
    }

    public equals(value: unknown): value is Complex {
      return (
        value instanceof Complex &&
        value.combinator === this.combinator &&
        value.left.equals(this.left) &&
        value.right.equals(this.right)
      );
    }

    public *[Symbol.iterator](): Iterator<Complex> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "complex",
        combinator: this.combinator,
        left: this.left,
        right: this.right
      };
    }

    public toString(): string {
      const combinator =
        this.combinator === Combinator.Descendant
          ? " "
          : ` ${this.combinator} `;

      return `${this.left}${combinator}${this.right}`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-complex-selector
   */
  const parseComplex = map(
    pair(parseCompound, zeroOrMore(pair(parseCombinator, parseCompound))),
    result => {
      const [left, selectors] = result;

      return reduce(
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

    public readonly combinator: Combinator;
    public readonly selector: Simple | Compound | Complex;

    private constructor(
      combinator: Combinator,
      selector: Simple | Compound | Complex
    ) {
      super();
      this.combinator = combinator;
      this.selector = selector;
    }

    public matches(): boolean {
      return false;
    }

    public equals(value: unknown): value is Relative {
      return (
        value instanceof Relative &&
        value.combinator === this.combinator &&
        value.selector.equals(this.selector)
      );
    }

    public *[Symbol.iterator](): Iterator<Relative> {
      yield this;
    }

    public toJSON(): unknown {
      return {
        type: "relative",
        combinator: this.combinator,
        selector: this.selector
      };
    }

    public toString(): string {
      const combinator =
        this.combinator === Combinator.Descendant ? "" : `${this.combinator} `;

      return `${combinator}${this.selector}`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-relative-selector
   */
  const parseRelative = map(pair(parseCombinator, parseComplex), result => {
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

    public readonly left: T;
    public readonly right: T | List<T>;

    private constructor(left: T, right: T | List<T>) {
      super();
      this.left = left;
      this.right = right;
    }

    public matches(element: Element): boolean {
      return this.left.matches(element) || this.right.matches(element);
    }

    public equals(value: unknown): value is List {
      return (
        value instanceof List &&
        value.left.equals(this.left) &&
        value.right.equals(this.right)
      );
    }

    public *[Symbol.iterator](): Iterator<
      Simple | Compound | Complex | Relative
    > {
      yield this.left;
      yield* this.right;
    }

    public toJSON(): unknown {
      return {
        type: "list",
        left: this.left,
        right: this.right
      };
    }

    public toString(): string {
      return `${this.left}, ${this.right}`;
    }
  }

  /**
   * @see https://drafts.csswg.org/selectors/#typedef-selector-list
   * @internal
   */
  const parseList = map(
    pair(
      either(parseRelative, parseComplex),
      zeroOrMore(
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          either(parseRelative, parseComplex)
        )
      )
    ),
    result => {
      let [left, selectors] = result;

      [left, ...selectors] = [...reverse(selectors), left];

      return reduce(selectors, (right, left) => List.of(left, right), left as
        | Simple
        | Compound
        | Complex
        | Relative
        | List);
    }
  );

  export function parse(input: string): Option<Selector> {
    return parseList(Slice.of([...lex(input)]))
      .flatMap<Selector>(([tokens, selector]) =>
        tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token")
      )
      .ok();
  }
}
