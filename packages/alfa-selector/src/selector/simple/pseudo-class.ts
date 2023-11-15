import { Cache } from "@siteimprove/alfa-cache";
import {
  Function,
  Nth,
  Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom/";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Slice } from "@siteimprove/alfa-slice";

import { Context } from "../../context";

import { Complex } from "../complex";
import { Compound } from "../compound";
import { List } from "../list";
import { Selector } from "../selector";
import type { Simple } from "../simple";

import { SimpleSelector } from "./simple";

const { State } = Context;
const { hasName, isElement } = Element;
const { either, end, left, mapResult, peek, right } = Parser;
const { and, not, test } = Predicate;

export abstract class PseudoClass<
  N extends string = string,
> extends SimpleSelector<"pseudo-class", N> {
  protected constructor(name: N) {
    super("pseudo-class", name);
  }

  public matches(element: dom.Element, context?: Context): boolean {
    return false;
  }

  public equals(value: PseudoClass): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoClass && super.equals(value);
  }

  public *[Symbol.iterator](): Iterator<PseudoClass> {
    yield this;
  }

  public toJSON(): PseudoClass.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `:${this._name}`;
  }
}

export namespace PseudoClass {
  export interface JSON<N extends string = string>
    extends SimpleSelector.JSON<"pseudo-class", N> {}

  export function isPseudoClass(value: unknown): value is PseudoClass {
    return value instanceof PseudoClass;
  }

  const parseNth = left(
    Nth.parse,
    end((token) => `Unexpected token ${token}`),
  );

  export function parse<S extends Selector>(
    parseSelector: () => CSSParser<
      Simple | Compound | Complex | List<Simple | Compound | Complex>
    >,
  ): CSSParser<PseudoClass> {
    return right(
      Token.parseColon,
      either(
        // Non-functional pseudo-classes
        mapResult(Token.parseIdent(), (ident) => {
          switch (ident.value) {
            case "hover":
              return Result.of<PseudoClass, string>(Hover.of());
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

        // Functional pseudo-classes
        mapResult(
          right(peek(Token.parseFunction()), Function.consume),
          (fn) => {
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
                      return Is.of(selector) as PseudoClass;
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
          },
        ),
      ),
    );
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#matches-pseudo}
 */
export class Is extends PseudoClass<"is"> {
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
  export interface JSON extends PseudoClass.JSON<"is"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#negation-pseudo}
 */
export class Not extends PseudoClass<"not"> {
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
  export interface JSON extends PseudoClass.JSON<"not"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends PseudoClass<"has"> {
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
  export interface JSON extends PseudoClass.JSON<"has"> {
    selector: Simple.JSON | Compound.JSON | Complex.JSON | List.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#hover-pseudo}
 */
export class Hover extends PseudoClass<"hover"> {
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
export class Active extends PseudoClass<"active"> {
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
export class Focus extends PseudoClass<"focus"> {
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
export class FocusWithin extends PseudoClass<"focus-within"> {
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
export class FocusVisible extends PseudoClass<"focus-visible"> {
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
export class Link extends PseudoClass<"link"> {
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
export class Visited extends PseudoClass<"visited"> {
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
export class Disabled extends PseudoClass<"disabled"> {
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
export class Enabled extends PseudoClass<"enabled"> {
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
export class Root extends PseudoClass<"root"> {
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
export class Host extends PseudoClass<"host"> {
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
export class Empty extends PseudoClass<"empty"> {
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
export class NthChild extends PseudoClass<"nth-child"> {
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
  export interface JSON extends PseudoClass.JSON<"nth-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends PseudoClass<"nth-last-child"> {
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
  export interface JSON extends PseudoClass.JSON<"nth-last-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-child-pseudo}
 */
export class FirstChild extends PseudoClass<"first-child"> {
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
export class LastChild extends PseudoClass<"last-child"> {
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
export class OnlyChild extends PseudoClass<"only-child"> {
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
export class NthOfType extends PseudoClass<"nth-of-type"> {
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
  export interface JSON extends PseudoClass.JSON<"nth-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo}
 */
export class NthLastOfType extends PseudoClass<"nth-last-of-type"> {
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
  export interface JSON extends PseudoClass.JSON<"nth-last-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-of-type-pseudo}
 */
export class FirstOfType extends PseudoClass<"first-of-type"> {
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
export class LastOfType extends PseudoClass<"last-of-type"> {
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
export class OnlyOfType extends PseudoClass<"only-of-type"> {
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
