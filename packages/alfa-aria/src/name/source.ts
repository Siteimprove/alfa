import {
  type Attribute,
  type Element,
  Node,
  type Text,
} from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

import type { Name } from "./name.js";

/**
 * @public
 */
export type Source =
  | Source.Data
  | Source.Descendant
  | Source.Ancestor
  | Source.Label
  | Source.Reference;

/**
 * @public
 */
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

  export class Descendant implements Equatable, Serializable<Descendant.JSON> {
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
        element: this._element.path(Node.flatTree),
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
      return value instanceof Label && value._attribute.equals(this._attribute);
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
