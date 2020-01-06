import { Iterable } from "@siteimprove/alfa-iterable";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

import { Namespace } from "../namespace";
import { Node } from "../node";
import { Block } from "../style/block";
import { Attribute } from "./attribute";
import { Document } from "./document";
import { Shadow } from "./shadow";
import { Slot } from "./slot";
import { Slotable } from "./slotable";

const { isNaN } = Number;
const { map, filter, concat, join, find, isEmpty } = Iterable;
const { not } = Predicate;

export class Element extends Node implements Slot, Slotable {
  public static of(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    attributes: Mapper<Element, Iterable<Attribute>> = self => [],
    children: Mapper<Node, Iterable<Node>> = self => [],
    style: Option<Block> = None,
    parent: Option<Node> = None,
    shadow: Option<Mapper<Element, Shadow>> = None,
    content: Option<Document> = None
  ): Element {
    return new Element(
      namespace,
      prefix,
      name,
      attributes,
      children,
      style,
      parent,
      shadow,
      content
    );
  }

  public readonly namespace: Option<Namespace>;
  public readonly prefix: Option<string>;
  public readonly name: string;
  public readonly attributes: Iterable<Attribute>;
  public readonly style: Option<Block>;
  public readonly shadow: Option<Shadow>;
  public readonly content: Option<Document>;

  private readonly _id: Lazy<Option<string>>;
  private readonly _classes: Lazy<Set<string>>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    attributes: Mapper<Element, Iterable<Attribute>>,
    children: Mapper<Node, Iterable<Node>>,
    style: Option<Block>,
    parent: Option<Node>,
    shadow: Option<Mapper<Element, Shadow>>,
    content: Option<Document>
  ) {
    super(children, parent);

    const self = Option.of(this);

    this.namespace = namespace;
    this.prefix = prefix;
    this.name = name;
    this.attributes = Array.from(attributes(this));
    this.style = style;
    this.shadow = self.apply(shadow);
    this.content = content;

    this._id = Lazy.of(() => this.attribute("id").map(attr => attr.value));

    this._classes = Lazy.of(() =>
      this.attribute("class")
        .map(attr => Set.from(attr.value.trim().split(/\s+/)))
        .getOr(Set.empty())
    );
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-id
   */
  public get id(): Option<string> {
    return this._id.force();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-class
   */
  public get classes(): Set<string> {
    return this._classes.force();
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.flattened === true) {
      return super.parent().flatMap(parent => {
        if (Element.isElement(parent) && parent.shadow.isSome()) {
          return this.assignedSlot().flatMap(slot => slot.parent(options));
        }

        return Option.of(parent);
      });
    }

    return super.parent();
  }

  public children(options: Node.Traversal = {}): Sequence<Node> {
    let children: Sequence<Node>;

    if (options.flattened === true) {
      if (this.shadow.isSome()) {
        return this.shadow.get().children(options);
      }

      if (Slot.isSlot(this)) {
        return Sequence.from(this.assignedNodes());
      }

      children = super
        .children()
        .flatMap(child =>
          Slot.isSlot(child) ? child.children(options) : Sequence.of(child)
        );
    } else {
      if (options.composed === true && this.shadow.isSome()) {
        children = Sequence.of(this.shadow.get(), Lazy.force(super.children()));
      } else {
        children = super.children();
      }
    }

    if (options.nested === true && this.content.isSome()) {
      children = children.concat(Sequence.of(this.content.get()));
    }

    return children;
  }

  public attribute(
    predicate: string | Predicate<Attribute>
  ): Option<Attribute> {
    return find(
      this.attributes,
      typeof predicate === "string"
        ? element => element.name === predicate
        : predicate
    );
  }

  /**
   * @see https://html.spec.whatwg.org/#void-elements
   */
  public isVoid(): boolean {
    switch (this.name) {
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
    return this.attribute("tabindex")
      .andThen(tabIndex => {
        const number = Number(tabIndex);

        if (isNaN(number) || number !== (number | 0)) {
          return None;
        }

        return Some.of(number);
      })
      .orElse(() => {
        if (isSuggestedFocusableElement(this)) {
          return Some.of(0);
        }

        return None;
      });
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

  public toJSON(): Element.JSON {
    return {
      type: "element",
      namespace: this.namespace.getOr(null),
      prefix: this.prefix.getOr(null),
      name: this.name,
      attributes: [...this.attributes].map(attribute => attribute.toJSON()),
      style: this.style.map(style => style.toJSON()).getOr(null),
      children: [...this.children()].map(child => child.toJSON()),
      shadow: this.shadow.map(shadow => shadow.toJSON()).getOr(null),
      content: this.content.map(content => content.toJSON()).getOr(null)
    };
  }

  public toString(): string {
    const name = this.prefix.reduce(
      (name, prefix) => `${prefix}:${name}`,
      this.name
    );

    const attributes = join(
      map(this.attributes, attribute => ` ${attribute.toString()}`),
      ""
    );

    if (this.isVoid()) {
      return `<${name}${attributes}>`;
    }

    const children = join(
      map(
        filter(
          map(concat(this.shadow, this.children()), child =>
            child.toString().trim()
          ),
          not(isEmpty)
        ),
        child => indent(child)
      ),
      "\n"
    );

    return `<${name}${attributes}>${
      children === "" ? "" : `\n${children}\n`
    }</${name}>`;
  }
}

export namespace Element {
  export function isElement(value: unknown): value is Element {
    return value instanceof Element;
  }

  export interface JSON {
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

  export function fromElement(
    element: JSON,
    parent: Option<Node> = None
  ): Element {
    return Element.of(
      Option.from(element.namespace as Namespace | null),
      Option.from(element.prefix),
      element.name,
      self => {
        const owner = Option.of(self);
        return element.attributes.map(attribute =>
          Attribute.fromAttribute(attribute, owner)
        );
      },
      self => {
        const parent = Option.of(self);
        return element.children.map(child => Node.fromNode(child, parent));
      },
      Option.from(element.style).map(style => Block.fromBlock(style)),
      parent,
      Option.from(element.shadow).map(shadow => self =>
        Shadow.fromShadow(shadow, self)
      ),
      Option.from(element.content).map(content =>
        Document.fromDocument(content)
      )
    );
  }
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
      return element.attribute("type").every(attr => attr.value !== "hidden");

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
        .some(parent => {
          if (parent.name === "details") {
            for (const child of element.children()) {
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
