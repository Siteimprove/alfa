import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Element, Node, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "./feature";
import { Role } from "./role";

const { hasId, isElement } = Element;
const { isText } = Text;
const { and, or, equals } = Predicate;

export class Name implements Equatable, Serializable {
  public static of(value: string, sources: Iterable<Name.Source>): Name {
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

  public get source(): Iterable<Name.Source> {
    return this._sources[Symbol.iterator]();
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
}

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

    export class Data implements Equatable, Serializable {
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

      public toJSON(): Data.JSON {
        return {
          type: "data",
        };
      }
    }

    export namespace Data {
      export interface JSON {
        [key: string]: json.JSON;
        type: "data";
      }
    }

    export function data(text: Text): Data {
      return Data.of(text);
    }

    export class Descendant implements Equatable, Serializable {
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

      public toJSON(): Descendant.JSON {
        return {
          type: "descendant",
          name: this._name.toJSON(),
        };
      }
    }

    export namespace Descendant {
      export interface JSON {
        [key: string]: json.JSON;
        type: "descendant";
        name: Name.JSON;
      }
    }

    export function descendant(element: Element, name: Name): Descendant {
      return Descendant.of(element, name);
    }

    export class Ancestor implements Equatable, Serializable {
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

      public toJSON(): Ancestor.JSON {
        return {
          type: "ancestor",
          name: this._name.toJSON(),
        };
      }
    }

    export namespace Ancestor {
      export interface JSON {
        [key: string]: json.JSON;
        type: "ancestor";
        name: Name.JSON;
      }
    }

    export function ancestor(element: Element, name: Name): Ancestor {
      return Ancestor.of(element, name);
    }

    export class Label implements Equatable, Serializable {
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

      public toJSON(): Label.JSON {
        return {
          type: "label",
          attribute: this._attribute.name,
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

    export class Reference implements Equatable, Serializable {
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

      public toJSON(): Reference.JSON {
        return {
          type: "reference",
          attribute: this._attribute.name,
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
  export interface State {
    /**
     * The elements that have been seen by the name computation so far. This is
     * used for detecting circular references resulting from things such as the
     * `aria-labelledby` attribute and form controls that get their name from
     * a containing `<label>` element.
     */
    readonly visited: Set<Element>;

    /**
     * Whether or not the name computation is the result of recursion.
     */
    readonly isRecursing: boolean;

    /**
     * Whether or not the name computation is the result of a reference.
     */
    readonly isReferencing: boolean;

    /**
     * Whether or not the name computation is descending into a subtree.
     */
    readonly isDescending: boolean;
  }

  export namespace State {
    /**
     * The initial, empty state of the name computation.
     */
    export const empty: State = {
      visited: Set.empty(),
      isRecursing: false,
      isReferencing: false,
      isDescending: false,
    };
  }

  export function from(
    node: Element | Text,
    device: Device
  ): Branched<Option<Name>, Browser> {
    return fromNode(node, device, State.empty);
  }

  /**
   * @internal
   */
  export function fromNode(
    node: Element | Text,
    device: Device,
    state: State
  ): Branched<Option<Name>, Browser> {
    return isElement(node) ? fromElement(node, device, state) : fromText(node);
  }

  /**
   * @internal
   */
  export function fromElement(
    element: Element,
    device: Device,
    state: State
  ): Branched<Option<Name>, Browser> {
    const empty = Branched.of(None);

    if (state.visited.has(element)) {
      return empty;
    } else {
      state = { ...state, visited: state.visited.add(element) };
    }

    return Role.from(element).flatMap((role) => {
      // Step 1: Does the role prohibit naming?
      // https://w3c.github.io/accname/#step1
      if (role.some((role) => role.isNameProhibited())) {
        return empty;
      }

      // Step 2A: Is the element hidden and not referenced?
      // https://w3c.github.io/accname/#step2A
      if (!state.isReferencing && !isRendered(element, device)) {
        return empty;
      }

      return fromSteps(
        // Step 2B: Use the `aria-labelledby` attribute, if present and allowed.
        // https://w3c.github.io/accname/#step2B
        () => {
          // Chained `aria-labelledby` references, such `foo` -> `bar` -> `baz`,
          // are not allowed.
          if (state.isReferencing) {
            return empty;
          }

          const attribute = element.attribute("aria-labelledby");

          if (attribute.isNone()) {
            return empty;
          }

          return fromReferences(attribute.get(), device, state);
        },

        // Step 2C: Use the `aria-label` attribute, if present.
        // https://w3c.github.io/accname/#step2C
        () => {
          const attribute = element.attribute("aria-label");

          if (attribute.isNone()) {
            return empty;
          }

          return fromLabel(attribute.get());
        },

        // Step 2D: Use native features, if present and allowed.
        // https://w3c.github.io/accname/#step2D
        () => {
          if (
            role.some((role) => role.isPresentational()) ||
            element.namespace.isNone()
          ) {
            return empty;
          }

          const feature = Feature.lookup(element.namespace.get(), element.name);

          if (feature.isNone()) {
            return empty;
          }

          return feature.get().name(element, device, state);
        },

        // Step 2F: Use the subtree content, if referencing and allowed.
        // https://w3c.github.io/accname/#step2F
        () => {
          if (
            !state.isReferencing &&
            !role.every((role) => role.isNamedBy("contents"))
          ) {
            return empty;
          }

          return fromDescendants(element, device, state);
        },

        // Step 2H: Use the subtree content, if descending.
        // https://w3c.github.io/accname/#step2H
        () => {
          if (!state.isDescending) {
            return empty;
          }

          return fromDescendants(element, device, state);
        },

        // Step 2I: Use a tooltip attribute, if present.
        // https://w3c.github.io/accname/#step2I
        () => {
          // The only known tooltip attribute is `title`, which is accepted by
          // both HTML and SVG elements.
          const attribute = element.attribute("title");

          if (attribute.isNone()) {
            return empty;
          }

          return fromLabel(attribute.get());
        }
      );
    });
  }

  /**
   * @internal
   */
  export function fromText(text: Text): Branched<Option<Name>, Browser> {
    // Step 2G: Use the data of the text node.
    // https://w3c.github.io/accname/#step2G
    return fromData(text);
  }

  /**
   * @internal
   */
  export function fromDescendants(
    element: Element,
    device: Device,
    state: State
  ): Branched<Option<Name>, Browser> {
    return Branched.traverse(
      element.children().filter(or(isText, isElement)),
      (element) =>
        fromNode(element, device, {
          ...state,
          isRecursing: true,
          isDescending: true,
        })
    )
      .map((names) =>
        [...names].filter((name) => name.isSome()).map((name) => name.get())
      )
      .map((names) => {
        const data = names
          .map((name) => name.value)
          .join(" ")
          .trim();

        if (data === "") {
          return None;
        }

        return Option.of(
          Name.of(
            data,
            names.map((name) => Source.descendant(element, name))
          )
        );
      });
  }

  /**
   * @internal
   */
  export function fromLabel(
    attribute: Attribute
  ): Branched<Option<Name>, Browser> {
    const data = flatten(attribute.value).trim();

    if (data === "") {
      return Branched.of(None);
    }

    return Branched.of(Option.of(Name.of(data, [Source.label(attribute)])));
  }

  /**
   * @internal
   */
  export function fromReferences(
    attribute: Attribute,
    device: Device,
    state: State
  ): Branched<Option<Name>, Browser> {
    const root = attribute.owner.get().root();

    const references = root
      .descendants()
      .filter(and(isElement, hasId(equals(...attribute.tokens()))));

    return Branched.traverse(references, (element) =>
      fromNode(element, device, {
        ...state,
        isRecursing: true,
        isReferencing: true,
        isDescending: false,
      })
    )
      .map((names) =>
        [...names].filter((name) => name.isSome()).map((name) => name.get())
      )
      .map((names) => {
        const data = names
          .map((name) => name.value)
          .join(" ")
          .trim();

        if (data === "") {
          return None;
        }

        return Option.of(
          Name.of(
            data,
            names.map((name) => Source.reference(attribute, name))
          )
        );
      });
  }

  /**
   * @internal
   */
  export function fromData(text: Text): Branched<Option<Name>, Browser> {
    const data = flatten(text.data);

    if (data === "") {
      return Branched.of(None);
    }

    return Branched.of(Option.of(Name.of(data, [Source.data(text)])));
  }

  /**
   * @internal
   */
  export function fromSteps(
    ...steps: Array<Thunk<Branched<Option<Name>, Browser>>>
  ): Branched<Option<Name>, Browser> {
    const step = (
      name: Branched<Option<Name>, Browser>,
      i: number = 0
    ): Branched<Option<Name>, Browser> => {
      if (i >= steps.length) {
        return name;
      }

      return name.flatMap((name, browsers) => {
        if (name.isSome()) {
          return Branched.of(name, ...browsers);
        }

        return step(steps[i](), i + 1);
      });
    };

    return step(Branched.of(None));
  }
}

function flatten(string: string): string {
  return string.replace(/\s+/g, " ");
}

function isRendered(node: Node, device: Device): boolean {
  if (Element.isElement(node)) {
    const display = Style.from(node, device).computed("display").value;

    const [outside] = display;

    if (outside.value === "none") {
      return false;
    }
  }

  return node
    .parent({ flattened: true })
    .every((parent) => isRendered(parent, device));
}
