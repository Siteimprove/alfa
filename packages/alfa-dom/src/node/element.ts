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
const { not } = Predicate;

/**
 * @public
 */
export class Element<N extends string = string>
  extends Node<"element">
  implements Slot, Slotable
{
  public static of<N extends string = string>(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: N,
    attributes: Iterable<Attribute> = [],
    children: Iterable<Node> = [],
    style: Option<Block> = None
  ): Element<N> {
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
  private readonly _name: N;
  private readonly _attributes: Map<string, Attribute>;
  private readonly _style: Option<Block>;
  private _shadow: Option<Shadow> = None;
  private _content: Option<Document> = None;
  private readonly _id: Option<string>;
  private readonly _classes: Array<string>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: N,
    attributes: Array<Attribute>,
    children: Array<Node>,
    style: Option<Block>
  ) {
    super(children, "element");

    this._namespace = namespace;
    this._prefix = prefix;
    this._name = name;
    this._attributes = new Map(
      attributes
        .filter((attribute) => attribute._attachOwner(this))
        .map((attribute) => [attribute.qualifiedName, attribute])
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

  public get name(): N {
    return this._name;
  }

  public get qualifiedName(): string {
    return this._prefix.reduce<string>(
      (name, prefix) => `${prefix}:${name}`,
      this._name
    );
  }

  public get attributes(): Sequence<Attribute> {
    return Sequence.from(this._attributes.values());
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
   * {@link https://dom.spec.whatwg.org/#concept-id}
   */
  public get id(): Option<string> {
    return this._id;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-class}
   */
  public get classes(): Sequence<string> {
    return Sequence.from(this._classes);
  }

  public parent(options: Node.Traversal = Node.Traversal.empty): Option<Node> {
    if (options.isSet(Node.Traversal.flattened)) {
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

  public children(
    options: Node.Traversal = Node.Traversal.empty
  ): Sequence<Node> {
    const children: Array<Node> = [];

    if (options.isSet(Node.Traversal.flattened)) {
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
      if (options.isSet(Node.Traversal.composed) && this._shadow.isSome()) {
        children.push(this._shadow.get());
      }

      children.push(...this._children);
    }

    if (options.isSet(Node.Traversal.nested) && this._content.isSome()) {
      children.push(this._content.get());
    }

    return Sequence.from(children);
  }

  public attribute<A extends string = string>(name: A): Option<Attribute<A>>;

  public attribute<A extends string = string>(
    predicate: Predicate<Attribute<A>>
  ): Option<Attribute<A>>;

  public attribute(
    nameOrPredicate: string | Predicate<Attribute>
  ): Option<Attribute> {
    if (typeof nameOrPredicate === "string") {
      return Option.from(this._attributes.get(nameOrPredicate));
    } else {
      return Iterable.find(this._attributes.values(), nameOrPredicate);
    }
  }

  /**
   * {@link https://html.spec.whatwg.org/#void-elements}
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
   * {@link https://html.spec.whatwg.org/#dom-tabindex}
   */
  public tabIndex(): Option<number> {
    for (const tabIndex of this.attribute("tabindex")) {
      const number = parseInt(tabIndex.value, 10);

      //Checking if tabindex isn't NaN, undefined, null, Infinity
      if (number === number && number === (number | 0)) {
        return Some.of(number);
      }
    }

    if (Element.isSuggestedFocusable(this)) {
      return Some.of(0);
    }

    return None;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#dom-slotable-assignedslot}
   */
  public assignedSlot(): Option<Slot> {
    return Slotable.findSlot(this);
  }

  /**
   * {@link https://html.spec.whatwg.org/#dom-slot-assignednodes}
   */
  public assignedNodes(): Iterable<Slotable> {
    return Slot.findSlotables(this);
  }

  /**
   * @internal
   **/
  protected _internalPath(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += this._name;

    const index = this.preceding(options)
      .filter(Element.isElement)
      .count((element) => element._name === this._name);

    path += `[${index + 1}]`;

    return path;
  }

  public toJSON(): Element.JSON<N> {
    return {
      ...super.toJSON(),
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      attributes: [...this._attributes.values()].map((attribute) =>
        attribute.toJSON()
      ),
      style: this._style.map((style) => style.toJSON()).getOr(null),
      shadow: this._shadow.map((shadow) => shadow.toJSON()).getOr(null),
      content: this._content.map((content) => content.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    const name = this.qualifiedName;

    const attributes = [...this._attributes.values()]
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

/**
 * @public
 */
export namespace Element {
  export interface JSON<N extends string = string>
    extends Node.JSON<"element"> {
    namespace: string | null;
    prefix: string | null;
    name: N;
    attributes: Array<Attribute.JSON>;
    style: Block.JSON | null;
    shadow: Shadow.JSON | null;
    content: Document.JSON | null;
  }

  export function isElement(value: unknown): value is Element {
    return value instanceof Element;
  }

  /**
   * @internal
   */
  export function fromElement<N extends string = string>(
    json: JSON<N>
  ): Trampoline<Element<N>> {
    return Trampoline.traverse(json.children ?? [], Node.fromNode).map(
      (children) => {
        const element = Element.of(
          Option.from(json.namespace as Namespace | null),
          Option.from(json.prefix),
          json.name,
          json.attributes.map((attribute) =>
            Attribute.fromAttribute(attribute).run()
          ),
          children,
          json.style?.length === 0
            ? None
            : Option.from(json.style).map(Block.from)
        );

        if (json.shadow !== null) {
          element._attachShadow(Shadow.fromShadow(json.shadow).run());
        }

        if (json.content !== null) {
          element._attachContent(Document.fromDocument(json.content).run());
        }

        return element;
      }
    );
  }

  export const {
    hasAttribute,
    hasDisplaySize,
    hasId,
    hasInputType,
    hasName,
    hasNamespace,
    hasTabIndex,
    hasUniqueId,
    isBrowsingContextContainer,
    isContent,
    isDisabled,
    isDocumentElement,
    isDraggable,
    isEditingHost,
    isFallback,
    isSuggestedFocusable,
    isReplaced,
  } = predicate;
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
