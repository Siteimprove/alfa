import { Cache } from "@siteimprove/alfa-cache";
import { Nth } from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom/";
import { Serializable } from "@siteimprove/alfa-json";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Context } from "../../../context";

import type { Absolute } from "../../index";

import { SimpleSelector } from "../simple";

const { State } = Context;
const { hasName, isElement } = Element;
const { and, not, test } = Predicate;

export abstract class PseudoClassSelector<
  N extends string = string,
> extends SimpleSelector<"pseudo-class", N> {
  protected constructor(name: N) {
    super("pseudo-class", name);
  }

  public matches(element: dom.Element, context?: Context): boolean {
    return false;
  }

  public equals(value: PseudoClassSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoClassSelector && super.equals(value);
  }

  public toJSON(): PseudoClassSelector.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `:${this._name}`;
  }
}

export namespace PseudoClassSelector {
  export interface JSON<N extends string = string>
    extends SimpleSelector.JSON<"pseudo-class", N> {}
}

/**
 * {@link https://drafts.csswg.org/selectors/#negation-pseudo}
 */
export class Not extends PseudoClassSelector<"not"> {
  public static of(selector: Absolute): Not {
    return new Not(selector);
  }

  private readonly _selector: Absolute;

  private constructor(selector: Absolute) {
    super("not");
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
  }

  public *[Symbol.iterator](): Iterator<Not> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"not"> {
    selector: Serializable.ToJSON<Absolute>;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#has-pseudo}
 */
export class Has extends PseudoClassSelector<"has"> {
  public static of(selector: Absolute): Has {
    return new Has(selector);
  }

  private readonly _selector: Absolute;

  private constructor(selector: Absolute) {
    super("has");
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
  }

  public *[Symbol.iterator](): Iterator<Has> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"has"> {
    selector: Serializable.ToJSON<Absolute>;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#hover-pseudo}
 */
export class Hover extends PseudoClassSelector<"hover"> {
  public static of(): Hover {
    return new Hover();
  }

  private constructor() {
    super("hover");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public *[Symbol.iterator](): Iterator<Hover> {
    yield this;
  }

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
export class Active extends PseudoClassSelector<"active"> {
  public static of(): Active {
    return new Active();
  }

  private constructor() {
    super("active");
  }

  public *[Symbol.iterator](): Iterator<Active> {
    yield this;
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
export class Focus extends PseudoClassSelector<"focus"> {
  public static of(): Focus {
    return new Focus();
  }

  private constructor() {
    super("focus");
  }

  public *[Symbol.iterator](): Iterator<Focus> {
    yield this;
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
export class FocusWithin extends PseudoClassSelector<"focus-within"> {
  public static of(): FocusWithin {
    return new FocusWithin();
  }

  private constructor() {
    super("focus-within");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public *[Symbol.iterator](): Iterator<FocusWithin> {
    yield this;
  }

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
export class FocusVisible extends PseudoClassSelector<"focus-visible"> {
  public static of(): FocusVisible {
    return new FocusVisible();
  }

  private constructor() {
    super("focus-visible");
  }

  public *[Symbol.iterator](): Iterator<FocusVisible> {
    yield this;
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
export class Link extends PseudoClassSelector<"link"> {
  public static of(): Link {
    return new Link();
  }

  private constructor() {
    super("link");
  }

  public *[Symbol.iterator](): Iterator<Link> {
    yield this;
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
export class Visited extends PseudoClassSelector<"visited"> {
  public static of(): Visited {
    return new Visited();
  }

  private constructor() {
    super("visited");
  }

  public *[Symbol.iterator](): Iterator<Visited> {
    yield this;
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
export class Disabled extends PseudoClassSelector<"disabled"> {
  public static of(): Disabled {
    return new Disabled();
  }

  private constructor() {
    super("disabled");
  }

  public *[Symbol.iterator](): Iterator<Disabled> {
    yield this;
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
export class Enabled extends PseudoClassSelector<"enabled"> {
  public static of(): Enabled {
    return new Enabled();
  }

  private constructor() {
    super("enabled");
  }

  public *[Symbol.iterator](): Iterator<Enabled> {
    yield this;
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
export class Root extends PseudoClassSelector<"root"> {
  public static of(): Root {
    return new Root();
  }

  private constructor() {
    super("root");
  }

  public *[Symbol.iterator](): Iterator<Root> {
    yield this;
  }

  public matches(element: Element): boolean {
    // The root element is the element whose parent is NOT itself an element.
    return element.parent().every(not(isElement));
  }
}

/**
 * {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 */
export class Host extends PseudoClassSelector<"host"> {
  public static of(): Host {
    return new Host();
  }

  private constructor() {
    super("host");
  }

  public *[Symbol.iterator](): Iterator<Host> {
    yield this;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#empty-pseudo}
 */
export class Empty extends PseudoClassSelector<"empty"> {
  public static of(): Empty {
    return new Empty();
  }

  private constructor() {
    super("empty");
  }

  public *[Symbol.iterator](): Iterator<Empty> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element.children().isEmpty();
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-child-pseudo}
 */
export class NthChild extends PseudoClassSelector<"nth-child"> {
  public static of(index: Nth): NthChild {
    return new NthChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-child");

    this._index = index;
  }

  public *[Symbol.iterator](): Iterator<NthChild> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"nth-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-child-pseudo}
 */
export class NthLastChild extends PseudoClassSelector<"nth-last-child"> {
  public static of(index: Nth): NthLastChild {
    return new NthLastChild(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(nth: Nth) {
    super("nth-last-child");

    this._index = nth;
  }

  public *[Symbol.iterator](): Iterator<NthLastChild> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"nth-last-child"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-child-pseudo}
 */
export class FirstChild extends PseudoClassSelector<"first-child"> {
  public static of(): FirstChild {
    return new FirstChild();
  }

  private constructor() {
    super("first-child");
  }

  public *[Symbol.iterator](): Iterator<FirstChild> {
    yield this;
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
export class LastChild extends PseudoClassSelector<"last-child"> {
  public static of(): LastChild {
    return new LastChild();
  }

  private constructor() {
    super("last-child");
  }

  public *[Symbol.iterator](): Iterator<LastChild> {
    yield this;
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
export class OnlyChild extends PseudoClassSelector<"only-child"> {
  public static of(): OnlyChild {
    return new OnlyChild();
  }

  private constructor() {
    super("only-child");
  }

  public *[Symbol.iterator](): Iterator<OnlyChild> {
    yield this;
  }

  public matches(element: Element): boolean {
    return element.inclusiveSiblings().filter(isElement).size === 1;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-of-type-pseudo}
 */
export class NthOfType extends PseudoClassSelector<"nth-of-type"> {
  public static of(index: Nth): NthOfType {
    return new NthOfType(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-of-type");

    this._index = index;
  }

  public *[Symbol.iterator](): Iterator<NthOfType> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"nth-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#nth-last-of-type-pseudo}
 */
export class NthLastOfType extends PseudoClassSelector<"nth-last-of-type"> {
  public static of(index: Nth): NthLastOfType {
    return new NthLastOfType(index);
  }

  private static readonly _indices = new WeakMap<Element, number>();

  private readonly _index: Nth;

  private constructor(index: Nth) {
    super("nth-last-of-type");

    this._index = index;
  }

  public *[Symbol.iterator](): Iterator<NthLastOfType> {
    yield this;
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
  export interface JSON extends PseudoClassSelector.JSON<"nth-last-of-type"> {
    index: Nth.JSON;
  }
}

/**
 * {@link https://drafts.csswg.org/selectors/#first-of-type-pseudo}
 */
export class FirstOfType extends PseudoClassSelector<"first-of-type"> {
  public static of(): FirstOfType {
    return new FirstOfType();
  }

  private constructor() {
    super("first-of-type");
  }

  public *[Symbol.iterator](): Iterator<FirstOfType> {
    yield this;
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
export class LastOfType extends PseudoClassSelector<"last-of-type"> {
  public static of(): LastOfType {
    return new LastOfType();
  }

  private constructor() {
    super("last-of-type");
  }

  public *[Symbol.iterator](): Iterator<LastOfType> {
    yield this;
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
export class OnlyOfType extends PseudoClassSelector<"only-of-type"> {
  public static of(): OnlyOfType {
    return new OnlyOfType();
  }

  private constructor() {
    super("only-of-type");
  }

  public *[Symbol.iterator](): Iterator<OnlyOfType> {
    yield this;
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
