import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Namespace } from "../namespace";
import { Node } from "../node";
import { Block } from "../style/block";
import { Attribute } from "./attribute";
import { Document } from "./document";
import { Shadow } from "./shadow";
import { Slot } from "./slot";
import { Slotable } from "./slotable";

import * as predicate from "./element/predicate";

const { isEmpty } = Iterable;
const { and, not } = Predicate;

export class Element extends Node implements Slot, Slotable {
  public static of(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    attributes: Iterable<Attribute> = [],
    children: Iterable<Node> = [],
    style: Option<Block> = None
  ): Element {
    return new Element(
      namespace,
      prefix,
      name,
      Array.from(attributes),
      Array.from(children),
      style
    );
  }

  private readonly _namespace: Option<Namespace>;
  private readonly _prefix: Option<string>;
  private readonly _name: string;
  private readonly _attributes: Array<Attribute>;
  private readonly _style: Option<Block>;
  private _shadow: Option<Shadow> = None;
  private _content: Option<Document> = None;
  private readonly _id: Option<string>;
  private readonly _classes: Array<string>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    attributes: Array<Attribute>,
    children: Array<Node>,
    style: Option<Block>
  ) {
    super(children);

    this._namespace = namespace;
    this._prefix = prefix;
    this._name = name;
    this._attributes = attributes.filter((attribute) =>
      attribute._attachOwner(this)
    );
    this._style = style;

    this._id = this.attribute("id").map((attr) => attr.value);

    this._classes = this.attribute("class")
      .map((attr) => attr.value.trim().split(/\s+/))
      .getOr([]);
  }

  public get namespace(): Option<Namespace> {
    return this._namespace;
  }

  public get prefix(): Option<string> {
    return this._prefix;
  }

  public get name(): string {
    return this._name;
  }

  public get attributes(): Iterable<Attribute> {
    return this._attributes;
  }

  public get style(): Option<Block> {
    return this._style;
  }

  public get shadow(): Option<Shadow> {
    return this._shadow;
  }

  public get content(): Option<Document> {
    return this._content;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-id
   */
  public get id(): Option<string> {
    return this._id;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-class
   */
  public get classes(): Iterable<string> {
    return this._classes;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.flattened === true) {
      return this._parent.flatMap((parent) => {
        if (Shadow.isShadow(parent)) {
          return parent.host;
        }

        if (Element.isElement(parent) && parent.shadow.isSome()) {
          return this.assignedSlot().flatMap((slot) => slot.parent(options));
        }

        return Option.of(parent);
      });
    }

    return this._parent;
  }

  public children(options: Node.Traversal = {}): Sequence<Node> {
    const children: Array<Node> = [];

    if (options.flattened === true) {
      if (this._shadow.isSome()) {
        return this._shadow.get().children(options);
      }

      if (Slot.isSlot(this)) {
        return Sequence.from(this.assignedNodes());
      }

      for (const child of this._children) {
        if (Slot.isSlot(child)) {
          children.push(...child.children(options));
        } else {
          children.push(child);
        }
      }
    } else {
      if (options.composed === true && this._shadow.isSome()) {
        children.push(this._shadow.get());
      }

      children.push(...this._children);
    }

    if (options.nested === true && this._content.isSome()) {
      children.push(this._content.get());
    }

    return Sequence.from(children);
  }

  public attribute(
    predicate: string | Predicate<Attribute>
  ): Option<Attribute> {
    return Iterable.find(
      this._attributes,
      typeof predicate === "string"
        ? (attribute) => attribute.hasName(predicate)
        : predicate
    );
  }

  /**
   * @see https://html.spec.whatwg.org/#void-elements
   */
  public isVoid(): boolean {
    switch (this._name) {
      case "area":
      case "base":
      case "basefont":
      case "bgsound":
      case "br":
      case "col":
      case "embed":
      case "frame":
      case "hr":
      case "img":
      case "input":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
        return true;
      default:
        return false;
    }
  }

  /**
   * @see https://html.spec.whatwg.org/#dom-tabindex
   */
  public tabIndex(): Option<number> {
    for (const tabIndex of this.attribute("tabindex")) {
      const number = Number(tabIndex.value);

      if (number === number && number === (number | 0)) {
        return Some.of(number);
      }
    }

    if (isSuggestedFocusableElement(this)) {
      return Some.of(0);
    }

    return None;
  }

  /**
   * @see https://dom.spec.whatwg.org/#dom-slotable-assignedslot
   */
  public assignedSlot(): Option<Slot> {
    return Slotable.findSlot(this);
  }

  /**
   * @see https://html.spec.whatwg.org/#dom-slot-assignednodes
   */
  public assignedNodes(): Iterable<Slotable> {
    return Slot.findSlotables(this);
  }

  public path(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += this._name;

    const index = this.preceding(options).count(
      and(Element.isElement, (element) => element._name === this._name)
    );

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(): Element.JSON {
    return {
      type: "element",
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      attributes: this._attributes.map((attribute) => attribute.toJSON()),
      style: this._style.map((style) => style.toJSON()).getOr(null),
      children: this._children.map((child) => child.toJSON()),
      shadow: this._shadow.map((shadow) => shadow.toJSON()).getOr(null),
      content: this._content.map((content) => content.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    const name = this._prefix.reduce(
      (name, prefix) => `${prefix}:${name}`,
      this._name
    );

    const attributes = this._attributes
      .map((attribute) => ` ${attribute.toString()}`)
      .join("");

    if (this.isVoid()) {
      return `<${name}${attributes}>`;
    }

    const children = [...this._shadow, ...this._children, ...this._content]
      .map((child) => child.toString().trim())
      .filter(not(isEmpty))
      .map(indent)
      .join("\n");

    return `<${name}${attributes}>${
      children === "" ? "" : `\n${children}\n`
    }</${name}>`;
  }

  /**
   * @internal
   */
  public _attachShadow(shadow: Shadow): boolean {
    if (this._frozen || this._shadow.isSome() || !shadow._attachHost(this)) {
      return false;
    }

    this._shadow = Option.of(shadow);

    return true;
  }

  /**
   * @internal
   */
  public _attachContent(document: Document): boolean {
    if (
      this._frozen ||
      this._content.isSome() ||
      !document._attachFrame(this)
    ) {
      return false;
    }

    this._content = Option.of(document);

    return true;
  }
}

export namespace Element {
  export interface JSON extends Node.JSON {
    type: "element";
    namespace: string | null;
    prefix: string | null;
    name: string;
    attributes: Array<Attribute.JSON>;
    style: Block.JSON | null;
    children: Array<Node.JSON>;
    shadow: Shadow.JSON | null;
    content: Document.JSON | null;
  }

  export function isElement(value: unknown): value is Element {
    return value instanceof Element;
  }

  /**
   * @internal
   */
  export function fromElement(json: JSON): Trampoline<Element> {
    return Trampoline.traverse(json.children, Node.fromNode).map((children) => {
      const element = Element.of(
        Option.from(json.namespace as Namespace | null),
        Option.from(json.prefix),
        json.name,
        json.attributes.map((attribute) =>
          Attribute.fromAttribute(attribute).run()
        ),
        children,
        Option.from(json.style).map(Block.from)
      );

      if (json.shadow !== null) {
        element._attachShadow(Shadow.fromShadow(json.shadow).run());
      }

      if (json.content !== null) {
        element._attachContent(Document.fromDocument(json.content).run());
      }

      return element;
    });
  }

  export const {
    hasId,
    hasName,
    hasNamespace,
    hasTabIndex,
    isDisabled,
  } = predicate;
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}

function isSuggestedFocusableElement(element: Element): boolean {
  switch (element.name) {
    case "a":
    case "link":
      return element.attribute("href").isSome();

    case "input":
      return element
        .attribute("type")
        .flatMap((attribute) => attribute.enumerate("hidden"))
        .isNone();

    case "audio":
    case "video":
      return element.attribute("controls").isSome();

    case "button":
    case "select":
    case "textarea":
      return true;

    case "summary":
      return element
        .parent()
        .filter(Element.isElement)
        .some((parent) => {
          if (parent.name === "details") {
            for (const child of parent.children()) {
              if (Element.isElement(child) && child.name === "summary") {
                return child === element;
              }
            }
          }

          return false;
        });
  }

  return (
    element.attribute("draggable").isSome() ||
    isEditingHost(element) ||
    isBrowsingContextContainer(element)
  );
}

/**
 * @see https://html.spec.whatwg.org/#editing-host
 */
function isEditingHost(element: Element): boolean {
  return element.attribute("contenteditable").isSome();
}

/**
 * @see https://html.spec.whatwg.org/#browsing-context-container
 */
function isBrowsingContextContainer(element: Element): boolean {
  return element.name === "iframe";
}
