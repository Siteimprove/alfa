import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Element, Node, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "./feature";
import { Role } from "./role";

import * as predicate from "./name/predicate";

import { isProgrammaticallyHidden } from "./dom/predicate/is-programmatically-hidden";

const { hasId, isElement } = Element;
const { isText } = Text;
const { equals, test } = Predicate;
const { or } = Refinement;
const { hasComputedStyle } = Style;

/**
 * @public
 */
export class Name implements Equatable, Serializable<Name.JSON> {
  public static of(value: string, sources: Iterable<Name.Source> = []): Name {
    return new Name(value, Array.from(sources));
  }

  private readonly _value: string;
  private readonly _sources: Array<Name.Source>;

  private constructor(value: string, sources: Array<Name.Source>) {
    this._value = value;
    this._sources = sources;
  }

  public get value(): string {
    return this._value;
  }

  public get source(): ReadonlyArray<Name.Source> {
    return this._sources;
  }

  public *sourceNodes(): Iterable<Node> {
    for (const source of this._sources) {
      yield* source;
    }
  }

  public isEmpty(): boolean {
    return this._value.length === 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Name &&
      value._value === this._value &&
      value._sources.length === this._sources.length &&
      value._sources.every((source, i) => source.equals(this._sources[i]))
    );
  }

  public toJSON(): Name.JSON {
    return {
      value: this._value,
      sources: this._sources.map((source) => source.toJSON()),
    };
  }

  public toString(): string {
    return this._value;
  }
}

/**
 * @public
 */
export namespace Name {
  export interface JSON {
    [key: string]: json.JSON;
    value: string;
    sources: Array<Source.JSON>;
  }

  export type Source =
    | Source.Data
    | Source.Descendant
    | Source.Ancestor
    | Source.Label
    | Source.Reference;

  export namespace Source {
    export type JSON =
      | Data.JSON
      | Descendant.JSON
      | Ancestor.JSON
      | Label.JSON
      | Reference.JSON;

    export class Data implements Equatable, Serializable<Data.JSON> {
      public static of(text: Text): Data {
        return new Data(text);
      }

      private readonly _text: Text;

      private constructor(text: Text) {
        this._text = text;
      }

      public get type(): "data" {
        return "data";
      }

      public get text(): Text {
        return this._text;
      }

      public equals(value: unknown): value is this {
        return value instanceof Data && value._text.equals(this._text);
      }

      public *[Symbol.iterator](): Iterator<Node> {
        yield this._text;
      }

      public toJSON(): Data.JSON {
        return {
          type: "data",
          text: this._text.path(),
        };
      }
    }

    export namespace Data {
      export interface JSON {
        [key: string]: json.JSON;
        type: "data";
        text: string;
      }
    }

    export function data(text: Text): Data {
      return Data.of(text);
    }

    export class Descendant
      implements Equatable, Serializable<Descendant.JSON>
    {
      public static of(element: Element, name: Name): Descendant {
        return new Descendant(element, name);
      }

      private readonly _element: Element;
      private readonly _name: Name;

      private constructor(element: Element, name: Name) {
        this._element = element;
        this._name = name;
      }

      public get type(): "descendants" {
        return "descendants";
      }

      public get element(): Element {
        return this._element;
      }

      public get name(): Name {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Descendant &&
          value._element.equals(this._element) &&
          value._name.equals(this._name)
        );
      }

      public *[Symbol.iterator](): Iterator<Node> {
        yield this._element;
        yield* this._name.sourceNodes();
      }

      public toJSON(): Descendant.JSON {
        return {
          type: "descendant",
          element: this._element.path(),
          name: this._name.toJSON(),
        };
      }
    }

    export namespace Descendant {
      export interface JSON {
        [key: string]: json.JSON;
        type: "descendant";
        element: string;
        name: Name.JSON;
      }
    }

    export function descendant(element: Element, name: Name): Descendant {
      return Descendant.of(element, name);
    }

    export class Ancestor implements Equatable, Serializable<Ancestor.JSON> {
      public static of(element: Element, name: Name): Ancestor {
        return new Ancestor(element, name);
      }

      private readonly _element: Element;
      private readonly _name: Name;

      private constructor(element: Element, name: Name) {
        this._element = element;
        this._name = name;
      }

      public get type(): "ancestor" {
        return "ancestor";
      }

      public get element(): Element {
        return this._element;
      }

      public get name(): Name {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Ancestor &&
          value._element.equals(this._element) &&
          value._name.equals(this._name)
        );
      }

      public *[Symbol.iterator](): Iterator<Node> {
        yield this._element;
        yield* this._name.sourceNodes();
      }

      public toJSON(): Ancestor.JSON {
        return {
          type: "ancestor",
          element: this._element.path(),
          name: this._name.toJSON(),
        };
      }
    }

    export namespace Ancestor {
      export interface JSON {
        [key: string]: json.JSON;
        type: "ancestor";
        element: string;
        name: Name.JSON;
      }
    }

    export function ancestor(element: Element, name: Name): Ancestor {
      return Ancestor.of(element, name);
    }

    export class Label implements Equatable, Serializable<Label.JSON> {
      public static of(attribute: Attribute): Label {
        return new Label(attribute);
      }

      private readonly _attribute: Attribute;

      private constructor(attribute: Attribute) {
        this._attribute = attribute;
      }

      public get type(): "label" {
        return "label";
      }

      public get attribute(): Attribute {
        return this._attribute;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Label && value._attribute.equals(this._attribute)
        );
      }

      public *[Symbol.iterator](): Iterator<Node> {
        yield this._attribute;
      }

      public toJSON(): Label.JSON {
        return {
          type: "label",
          attribute: this._attribute.path(),
        };
      }
    }

    export namespace Label {
      export interface JSON {
        [key: string]: json.JSON;
        type: "label";
        attribute: string;
      }
    }

    export function label(attribute: Attribute): Label {
      return Label.of(attribute);
    }

    export class Reference implements Equatable, Serializable<Reference.JSON> {
      public static of(attribute: Attribute, name: Name): Reference {
        return new Reference(attribute, name);
      }

      private readonly _attribute: Attribute;
      private readonly _name: Name;

      private constructor(attribute: Attribute, name: Name) {
        this._attribute = attribute;
        this._name = name;
      }

      public get type(): "reference" {
        return "reference";
      }

      public get attribute(): Attribute {
        return this._attribute;
      }

      public get name(): Name {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Reference && value._attribute.equals(this._attribute)
        );
      }

      public *[Symbol.iterator](): Iterator<Node> {
        yield this._attribute;
        yield* this._name.sourceNodes();
      }

      public toJSON(): Reference.JSON {
        return {
          type: "reference",
          attribute: this._attribute.path(),
          name: this._name.toJSON(),
        };
      }
    }

    export namespace Reference {
      export interface JSON {
        [key: string]: json.JSON;
        type: "reference";
        attribute: string;
        name: Name.JSON;
      }
    }

    export function reference(attribute: Attribute, name: Name): Reference {
      return Reference.of(attribute, name);
    }
  }

  /**
   * @internal
   */
  export class State implements Equatable, Serializable<State.JSON> {
    private static _empty = new State([], None, None, false, false);

    public static empty(): State {
      return this._empty;
    }

    private readonly _visited: Array<Element>;
    // which element has an aria-labelledby causing the current traversal?
    private readonly _referrer: Option<Element>;
    // which element was the target of aria-labelledby?
    private readonly _referred: Option<Element>;
    private readonly _isRecursing: boolean;
    private readonly _isDescending: boolean;

    private constructor(
      visited: Array<Element>,
      referrer: Option<Element>,
      referred: Option<Element>,
      isRecursing: boolean,
      isDescending: boolean
    ) {
      this._visited = visited;
      this._referrer = referrer;
      this._referred = referred;
      this._isRecursing = isRecursing;
      this._isDescending = isDescending;
    }

    /**
     * The elements that have been seen by the name computation so far. This is
     * used for detecting circular references resulting from things such as the
     * `aria-labelledby` attribute and form controls that get their name from
     * a containing `<label>` element.
     */
    public get visited(): Iterable<Element> {
      return this._visited;
    }

    /**
     * The element that referenced the name computation.
     * (this is the element on which aria-labelledby is set)
     */
    public get referrer(): Option<Element> {
      return this._referrer;
    }

    /**
     * The element that is referenced during the name computation.
     * (this is the target of the aria-labelledby attribute)
     */
    public get referred(): Option<Element> {
      return this._referred;
    }

    /**
     * Whether or not the name computation is the result of recursion.
     */
    public get isRecursing(): boolean {
      return this._isRecursing;
    }

    /**
     * Whether or not the name computation is the result of a reference.
     */
    public get isReferencing(): boolean {
      return this._referrer.isSome();
    }

    /**
     * Whether or not the name computation is descending into a subtree.
     */
    public get isDescending(): boolean {
      return this._isDescending;
    }

    public hasVisited(element: Element): boolean {
      return this._visited.includes(element);
    }

    public visit(element: Element): State {
      if (this._visited.includes(element)) {
        return this;
      }

      return new State(
        [...this._visited, element],
        this._referrer,
        this._referred,
        this._isRecursing,
        this._isDescending
      );
    }

    public recurse(isRecursing: boolean): State {
      if (this._isRecursing === isRecursing) {
        return this;
      }

      return new State(
        this._visited,
        this._referrer,
        this._referred,
        isRecursing,
        this._isDescending
      );
    }

    /**
     * @remarks
     * This set both _referrer and _referred, so that they will always be
     * either both Some or both None.
     *
     * @remarks
     * We currently have no way to clear references since we currently have no
     * use for it.
     */
    public reference(referrer: Element, referred: Element): State {
      if (
        this._referrer.includes(referrer) &&
        this._referred.includes(referred)
      ) {
        return this;
      }

      return new State(
        this._visited,
        Option.of(referrer),
        Option.of(referred),
        this._isRecursing,
        this._isDescending
      );
    }

    public descend(isDescending: boolean): State {
      if (this._isDescending === isDescending) {
        return this;
      }

      return new State(
        this._visited,
        this._referrer,
        this._referred,
        this._isRecursing,
        isDescending
      );
    }

    public equals(state: State): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof State &&
        Array.equals(value._visited, this._visited) &&
        value._referrer.equals(this._referrer) &&
        value._referred.equals(this._referred) &&
        value._isRecursing === this._isRecursing &&
        value._isDescending === this._isDescending
      );
    }

    public toJSON(): State.JSON {
      return {
        visited: this._visited.map((element) => element.path()),
        referrer: this._referrer.map((element) => element.path()).getOr(null),
        referred: this._referred.map((element) => element.path()).getOr(null),
        isRecursing: this._isRecursing,
        isDescending: this._isDescending,
      };
    }
  }

  export namespace State {
    export interface JSON {
      [key: string]: json.JSON;
      visited: Array<string>;
      referrer: string | null;
      referred: string | null;
      isRecursing: boolean;
      isDescending: boolean;
    }
  }

  export function from(node: Element | Text, device: Device): Option<Name> {
    return fromNode(node, device, State.empty());
  }

  const names = Cache.empty<Device, Cache<Node, Option<Name>>>();

  /**
   * @internal
   */
  export function fromNode(
    node: Element | Text,
    device: Device,
    state: State
  ): Option<Name> {
    // Construct a thunk with the computed name of the node. We first need to
    // decide whether or not we can pull the name of the node from the cache and
    // so the actual computation of the name must be delayed.
    const name = () =>
      isElement(node) ? fromElement(node, device, state) : fromText(node);

    if (isElement(node)) {
      // As chained references are not allowed, we cannot make use of the cache
      // when computing a referenced name. If, for example, <foo> references
      // <bar> and <bar> references <baz>...
      //
      //   <foo> -> <bar> -> <baz> "Hello world"
      //
      // ...the reference from <bar> to <baz> is only allowed to be followed
      // when computing a name for <bar>:
      //
      //   <bar> "Hello world" -> <baz> "Hello world"
      //
      // When computing the name for <foo>, however, the second reference must
      // be ignored and the name for <bar> computed as if though the reference
      // does not exist:
      //
      //   <foo> null -> <bar> null
      //
      // We therefore cannot make use of whatever is in the cache for <bar>.
      if (state.isReferencing) {
        return name();
      }

      // If we're descending then the name already in the cache may not be
      // relevant due to the last step of the name computation. If, for example,
      // <baz> is a child of <bar> which is a child of <foo>...
      //
      //   <foo>
      //     <bar>
      //       <baz> "Hello world"
      //
      // ...and the name of <baz> has already been computed as "Hello world" and
      // we then compute the name of <bar> and <bar> is not allowed to be named
      // by its contents, it will not have a name:
      //
      //   <bar> null
      //     <baz> "Hello world"
      //
      // However, when we compute the name of <foo> and <foo> is allowed to be
      // named by its contents, the last step of the same computation kicks in
      // and includes all descendant names:
      //
      //   <foo> "Hello world"
      //     <bar> "Hello world"
      //       <baz> "Hello world"
      //
      // We therefore cannot make use of whatever is in the cache for <bar>.
      if (state.isDescending) {
        return name();
      }
    }

    return names.get(device, Cache.empty).get(node, name);
  }

  /**
   * @internal
   */
  export function fromElement(
    element: Element,
    device: Device,
    state: State
  ): Option<Name> {
    if (state.hasVisited(element)) {
      // While self-references are allowed, any other forms of circular
      // references are not. If the referrer therefore isn't the element itself,
      // the result will be an empty name.
      if (!state.referrer.includes(element)) {
        return None;
      }
    } else {
      state = state.visit(element);
    }

    // The following code handles the _generic_ steps of the accessible name
    // computation, that is any steps that are shared for all namespaces. All
    // remaining steps are handled by namespace-specific feature mappings.

    const role = Role.from(element);

    // Step 1: Does the role prohibit naming?
    // https://w3c.github.io/accname/#step1
    // Step 1 is skipped when referencing due to step 2B.ii.b
    // https://w3c.github.io/accname/#step2B.ii.b
    // Step 1 is skipped when descending due to step 2F.iii.b
    // https://w3c.github.io/accname/#step2B.iii.b
    if (
      !state.isReferencing &&
      !state.isDescending &&
      role.some((role) => role.isNameProhibited())
    ) {
      return None;
    }

    // Step 2A: Is the element hidden and not part of a reference traversal
    // whose root was hidden?
    // https://w3c.github.io/accname/#step2A
    if (
      // The element is hidden
      // https://www.w3.org/TR/wai-aria-1.2/#dfn-hidden
      // https://w3c.github.io/accname/#step2A (first comment)
      test(isProgrammaticallyHidden(device), element)
    ) {
      // The element is not part of a traversal
      if (!state.isReferencing) {
        return None;
      }

      // The element is part of a native host language traversal;
      // this is detected by having the referrer and the referred being the
      // same.
      // This is theoretically not needed, see
      // https://github.com/Siteimprove/alfa/issues/1266
      if (state.referrer.equals(state.referred)) {
        return None;
      }

      // The element is part of an `aria-labelledby` traversal whose root was
      // not hidden.
      if (state.referred.none(isProgrammaticallyHidden(device))) {
        return None;
      }

      // The element is part of an `aria-labelledby` traversal whose root
      // was hidden, keep going.
    }

    return fromSteps(
      // Step 2B: Use the `aria-labelledby` attribute, if present and allowed.
      // https://w3c.github.io/accname/#step2B
      () => {
        // Chained `aria-labelledby` references, such `foo` -> `bar` -> `baz`,
        // are not allowed. If the element is therefore being referenced
        // already then this step produces an empty name.
        if (state.isReferencing) {
          return None;
        }

        return element
          .attribute("aria-labelledby")
          .flatMap((attribute) =>
            fromReferences(attribute, element, device, state)
          );
      },

      // Step 2C: control embedded in a label, not currently handled
      // https://github.com/Siteimprove/alfa/issues/305

      // Step 2D: Use the `aria-label` attribute, if present.
      // https://w3c.github.io/accname/#step2D
      () => {
        return element
          .attribute("aria-label")
          .flatMap((attribute) => fromLabel(attribute));
      },

      // Step 2E: Use native features, if present and allowed.
      // https://w3c.github.io/accname/#step2E
      () => {
        // Using native features is only allowed if the role, if any, of the
        // element is not presentational and the element has a namespace with
        // which to look up its feature mapping, if it exists. If the role of
        // element therefore is presentational or the element has no namespace
        // then this step produces an empty name.
        if (
          role.some((role) => role.isPresentational()) ||
          !element.namespace.isSome()
        ) {
          return None;
        }

        return Feature.from(element.namespace.get(), element.name).flatMap(
          (feature) => feature.name(element, device, state)
        );
      },

      // Step 2F: Use the subtree content, if referencing or allowed.
      // https://w3c.github.io/accname/#step2F
      () => {
        // Using the subtree content is only allowed if the element is either
        // being referenced or the role, if any, of the element allows it to
        // be named by its content. If the element therefore isn't being
        // referenced and is not allowed to be named by its content then this
        // step produces an empty name.
        if (
          !state.isReferencing &&
          !role.some((role) => role.isNamedBy("contents"))
        ) {
          return None;
        }

        return fromDescendants(element, device, state);
      },

      // Step 2H: Use the subtree content, if descending.
      // https://w3c.github.io/accname/#step2H
      () => {
        // Unless we're already descending then this step produces an empty
        // name.
        if (!state.isDescending) {
          return None;
        }

        return fromDescendants(element, device, state);
      }
    );
  }

  /**
   * @internal
   */
  export function fromText(text: Text): Option<Name> {
    // Step 2G: Use the data of the text node.
    // https://w3c.github.io/accname/#step2G
    return fromData(text);
  }

  /**
   * @remarks
   * Firefox incorrectly skips aria-labelledby when descending
   * {@link https://bugzilla.mozilla.org/show_bug.cgi?id=1652712}
   *
   * @internal
   */
  export function fromDescendants(
    element: Element,
    device: Device,
    state: State
  ): Option<Name> {
    const names: Sequence<readonly [string, Name]> = element
      .children()
      .filter(or(isText, isElement))
      .collect((element) =>
        fromNode(element, device, state.recurse(true).descend(true)).map(
          (name) => {
            if (
              test(
                hasComputedStyle(
                  "display",
                  ({ values: [outside] }) => outside.value === "block",
                  device
                ),
                element
              )
            ) {
              return [` ${name.value} `, name];
            }
            return [name.value, name];
          }
        )
      );

    const name = flatten(names.map(([value]) => value).join("")).trim();

    if (name === "") {
      return None;
    }

    return Option.of(
      Name.of(
        name,
        names.map(([, name]) => Source.descendant(element, name))
      )
    );
  }

  /**
   * @internal
   */
  export function fromLabel(attribute: Attribute): Option<Name> {
    const name = flatten(attribute.value);

    if (name === "") {
      return None;
    }

    return Option.of(Name.of(name, [Source.label(attribute)]));
  }

  /**
   * @internal
   */
  export function fromReferences(
    attribute: Attribute,
    referrer: Element,
    device: Device,
    state: State
  ): Option<Name> {
    if (!attribute.owner.isSome()) {
      return None;
    }
    const root = attribute.owner.get().root();
    const ids = attribute.tokens().toArray();

    // Since there are a lot of elements in the document, but very few in the
    // aria-labelledby, it is more efficient to grab them in DOM order (in a
    // single traversal) and then sort by tokens order rather than grab the ids
    // one by one in the correct order.
    const references = root
      .elementDescendants()
      .filter(hasId(equals(...ids)))
      .sortWith((a, b) =>
        Comparable.compareNumber(
          // the previous filter ensure that the id exists
          ids.indexOf(a.id.getUnsafe()),
          ids.indexOf(b.id.getUnsafe())
        )
      );

    const names = references.collect((element) =>
      fromNode(
        element,
        device,
        state.reference(referrer, element).recurse(true).descend(false)
      )
    );

    const name = flatten(names.map((name) => name.value).join(" "));

    if (name === "") {
      return None;
    }

    return Option.of(
      Name.of(name, [
        Source.reference(
          attribute,
          Name.of(
            name,
            names.flatMap((name) => Sequence.from(name.source))
          )
        ),
      ])
    );
  }

  /**
   * @internal
   */
  export function fromData(text: Text): Option<Name> {
    const name = flatten(text.data);

    if (name === "") {
      return None;
    }

    return Option.of(Name.of(name, [Source.data(text)]));
  }

  /**
   * @internal
   */
  export function fromSteps(
    ...steps: Array<Thunk<Option<Name>>>
  ): Option<Name> {
    return Array.collectFirst(steps, (step) => step());
  }

  export const { hasValue } = predicate;
}

function flatten(string: string): string {
  return string.replace(/\s+/g, " ");
}
