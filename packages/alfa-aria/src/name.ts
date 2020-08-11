import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Element, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Set } from "@siteimprove/alfa-set";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "./feature";

const { hasId, isElement } = Element;
const { isText } = Text;
const { and, or, equals } = Predicate;

export class Name implements Equatable, Serializable {
  public static of(value: string, source: Name.Source): Name {
    return new Name(value, source);
  }

  private readonly _value: string;
  private readonly _source: Name.Source;

  private constructor(value: string, source: Name.Source) {
    this._value = value;
    this._source = source;
  }

  public get value(): string {
    return this._value;
  }

  public get source(): Name.Source {
    return this._source;
  }

  public isEmpty(): boolean {
    return this._value.length === 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Name &&
      value._value === this._value &&
      value._source.equals(this._source)
    );
  }

  public toJSON(): Name.JSON {
    return {
      value: this._value,
      source: this._source.toJSON(),
    };
  }
}

export namespace Name {
  export interface JSON {
    [key: string]: json.JSON;
    value: string;
    source: Source.JSON;
  }

  export type Source =
    | Source.Data
    | Source.Content
    | Source.Label
    | Source.Reference
    | Source.Title;

  export namespace Source {
    export type JSON =
      | Data.JSON
      | Content.JSON
      | Label.JSON
      | Reference.JSON
      | Title.JSON;

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

    export class Content implements Equatable, Serializable {
      public static of(element: Element, names: Iterable<Name>): Content {
        return new Content(element, Array.from(names));
      }

      private readonly _element: Element;
      private readonly _names: Array<Name>;

      private constructor(element: Element, names: Array<Name>) {
        this._element = element;
        this._names = names;
      }

      public get type(): "content" {
        return "content";
      }

      public get element(): Element {
        return this._element;
      }

      public get names(): Iterable<Name> {
        return this._names;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Content &&
          value._element.equals(this._element) &&
          value._names.length === this._names.length &&
          value._names.every((name, i) => name.equals(this._names[i]))
        );
      }

      public toJSON(): Content.JSON {
        return {
          type: "content",
          names: this._names.map((name) => name.toJSON()),
        };
      }
    }

    export namespace Content {
      export interface JSON {
        [key: string]: json.JSON;
        type: "content";
        names: Array<Name.JSON>;
      }
    }

    export function content(element: Element, names: Iterable<Name>): Content {
      return Content.of(element, names);
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
      public static of(attribute: Attribute, names: Iterable<Name>): Reference {
        return new Reference(attribute, Array.from(names));
      }

      private readonly _attribute: Attribute;
      private readonly _names: Array<Name>;

      private constructor(attribute: Attribute, names: Array<Name>) {
        this._attribute = attribute;
        this._names = names;
      }

      public get type(): "reference" {
        return "reference";
      }

      public get attribute(): Attribute {
        return this._attribute;
      }

      public get names(): Iterable<Name> {
        return this._names;
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
          names: this._names.map((name) => name.toJSON()),
        };
      }
    }

    export namespace Reference {
      export interface JSON {
        [key: string]: json.JSON;
        type: "reference";
        attribute: string;
        names: Array<Name.JSON>;
      }
    }

    export function reference(
      attribute: Attribute,
      names: Iterable<Name>
    ): Reference {
      return Reference.of(attribute, Array.from(names));
    }

    export class Title implements Equatable, Serializable {
      public static of(attribute: Attribute): Title {
        return new Title(attribute);
      }

      private readonly _attribute: Attribute;

      private constructor(attribute: Attribute) {
        this._attribute = attribute;
      }

      public get type(): "title" {
        return "title";
      }

      public get attribute(): Attribute {
        return this._attribute;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Title && value._attribute.equals(this._attribute)
        );
      }

      public toJSON(): Title.JSON {
        return {
          type: "title",
          attribute: this._attribute.name,
        };
      }
    }

    export namespace Title {
      export interface JSON {
        [key: string]: json.JSON;
        type: "title";
        attribute: string;
      }
    }

    export function title(attribute: Attribute): Title {
      return Title.of(attribute);
    }
  }

  export function from(
    node: Element | Text,
    device: Device
  ): Branched<Option<Name>, Browser> {
    return fromNode(node, device, Set.empty());
  }

  /**
   * @internal
   */
  export function fromNode(
    node: Element | Text,
    device: Device,
    visited: Set<Element>
  ): Branched<Option<Name>, Browser> {
    return isElement(node)
      ? fromElement(node, device, visited)
      : fromText(node);
  }

  /**
   * @internal
   */
  export function fromElement(
    element: Element,
    device: Device,
    visited: Set<Element>
  ): Branched<Option<Name>, Browser> {
    const empty = Branched.of(None);

    if (visited.has(element)) {
      return empty;
    } else {
      visited = visited.add(element);
    }

    return fromSteps(
      // Step 2B: Use the `aria-labelledby` attribute, if present.
      // https://w3c.github.io/accname/#step2B
      () => {
        const attribute = element.attribute("aria-labelledby");

        if (attribute.isNone()) {
          return empty;
        }

        return fromReference(attribute.get(), device, visited);
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

      // Step 2D: Use native features, if present.
      // https://w3c.github.io/accname/#step2D
      () => {
        if (element.namespace.isNone()) {
          return empty;
        }

        const feature = Feature.lookup(element.namespace.get(), element.name);

        if (feature.isNone()) {
          return empty;
        }

        return feature.get().name(element, device, visited);
      },

      // Step 2F: Use the subtree content, if allowed.
      // https://w3c.github.io/accname/#step2F
      () => {
        return fromContent(element, device, visited);
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
  export function fromContent(
    element: Element,
    device: Device,
    visited: Set<Element>
  ): Branched<Option<Name>, Browser> {
    return Branched.traverse(
      element.children().filter(or(isText, isElement)),
      (element) => fromNode(element, device, visited)
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

        return Option.of(Name.of(data, Source.Content.of(element, names)));
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

    return Branched.of(Option.of(Name.of(data, Source.Label.of(attribute))));
  }

  /**
   * @internal
   */
  export function fromReference(
    attribute: Attribute,
    device: Device,
    visited: Set<Element>
  ): Branched<Option<Name>, Browser> {
    const root = attribute.owner.get().root();

    const references = root
      .descendants()
      .filter(and(isElement, hasId(equals(...attribute.tokens()))));

    return Branched.traverse(references, (element) =>
      fromNode(element, device, visited)
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

        return Option.of(Name.of(data, Source.Reference.of(attribute, names)));
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

    return Branched.of(Option.of(Name.of(data, Source.Data.of(text))));
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
