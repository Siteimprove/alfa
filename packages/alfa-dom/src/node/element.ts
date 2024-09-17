import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Sequence } from "@siteimprove/alfa-sequence";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import type { Namespace } from "../namespace.js";
import { Node } from "../node.js";

import { Block } from "../style/block.js";
import { Declaration } from "../style/declaration.js";

import { Attribute } from "./attribute.js";
import { Document } from "./document.js";
import { Shadow } from "./shadow.js";
import { Slot } from "./slot.js";
import { Slotable } from "./slotable.js";

import * as helpers from "./element/input-type.js";
import * as predicate from "./element/predicate.js";

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
    style: Option<Block> = None,
    box: Option<Rectangle> = None,
    device: Option<Device> = None,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ): Element<N> {
    return new Element(
      namespace,
      prefix,
      name,
      Array.from(attributes),
      Array.from(children),
      style,
      box,
      device,
      externalId,
      serializationId,
      extraData,
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
  private readonly _boxes: Cache<Device, Rectangle>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: N,
    attributes: Array<Attribute>,
    children: Array<Node>,
    style: Option<Block>,
    box: Option<Rectangle>,
    device: Option<Device>,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super(children, "element", externalId, serializationId, extraData);

    this._namespace = namespace;
    this._prefix = prefix;
    this._name = name;
    this._attributes = new Map(
      attributes
        .filter((attribute) => attribute._attachOwner(this))
        .map((attribute) => [attribute.qualifiedName, attribute]),
    );

    style.forEach((block) =>
      Iterable.forEach(block, (declaration) => declaration._attachOwner(this)),
    );
    this._style = style;

    this._id = this.attribute("id").map((attr) => attr.value);

    this._classes = this.attribute("class")
      .map((attr) => attr.value.trim().split(/\s+/))
      .getOr([]);

    this._boxes = Cache.from(
      device.isSome() && box.isSome() ? [[device.get(), box.get()]] : [],
    );
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
      this._name,
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

  public getBoundingBox(device: Device): Option<Rectangle> {
    return this._boxes.get(device);
  }

  public children(
    options: Node.Traversal = Node.Traversal.empty,
  ): Sequence<Node> {
    const treeChildren = this._children as Array<Node>;
    const children: Array<Node> = [];

    if (options.isSet(Node.Traversal.flattened)) {
      if (this._shadow.isSome()) {
        return this._shadow.get().children(options);
      }

      if (Slot.isSlot(this)) {
        return Sequence.from(this.assignedNodes());
      }

      for (const child of treeChildren) {
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

      children.push(...treeChildren);
    }

    if (options.isSet(Node.Traversal.nested) && this._content.isSome()) {
      children.push(this._content.get());
    }

    return Sequence.from(children);
  }

  public attribute<A extends string = string>(name: A): Option<Attribute<A>>;

  public attribute<A extends string = string>(
    predicate: Predicate<Attribute<A>>,
  ): Option<Attribute<A>>;

  public attribute(
    nameOrPredicate: string | Predicate<Attribute>,
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

  public toJSON(
    options: Node.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Element.MinimalJSON;

  public toJSON(
    options: Node.SerializationOptions & {
      verbosity: json.Serializable.Verbosity.High;
    },
  ): Element.JSON & { assignedSlot: Element.MinimalJSON | null };

  public toJSON(options?: Node.SerializationOptions): Element.JSON<N>;

  public toJSON(
    options?: Node.SerializationOptions,
  ):
    | Element.MinimalJSON
    | Element.JSON<N>
    | (Element.JSON & { assignedSlot: Element.MinimalJSON | null }) {
    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    const result:
      | Element.MinimalJSON
      | Element.JSON<N>
      | (Element.JSON & { assignedSlot: Element.MinimalJSON | null }) =
      super.toJSON(options);

    if (verbosity < json.Serializable.Verbosity.Medium) {
      return result;
    }

    if (verbosity >= json.Serializable.Verbosity.High) {
      result.assignedSlot = this.assignedSlot()
        .map((slot) =>
          slot.toJSON({ verbosity: json.Serializable.Verbosity.Minimal }),
        )
        .getOr(null);
    }

    return {
      ...result,
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      attributes: [...this._attributes.values()].map((attribute) =>
        attribute.toJSON(options),
      ),
      style: this._style.map((style) => style.toJSON()).getOr(null),
      shadow: this._shadow.map((shadow) => shadow.toJSON(options)).getOr(null),
      content: this._content
        .map((content) => content.toJSON(options))
        .getOr(null),
      box:
        options?.device === undefined
          ? null
          : this._boxes
              .get(options.device)
              .map((box) => box.toJSON())
              .getOr(null),
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
      .map((child) => {
        const value = child.toString();

        // If the child is only spaces, we do not want to trim them to nothingness.
        if (value.match(/\s+/) !== null) {
          return value;
        }

        return value.trim();
      })
      .filter(not(isEmpty))
      .map(String.indent)
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
  export interface MinimalJSON extends Node.JSON<"element"> {}

  export interface JSON<N extends string = string>
    extends Node.JSON<"element"> {
    namespace: string | null;
    prefix: string | null;
    name: N;
    attributes: Array<Attribute.JSON>;
    style: Block.JSON | string | null;
    shadow: Shadow.JSON | null;
    content: Document.JSON | null;
    box: Rectangle.JSON | null;
  }

  export function isElement(value: unknown): value is Element {
    return value instanceof Element;
  }

  /**
   * @internal
   */
  export function fromElement<N extends string = string>(
    json: JSON<N>,
    device?: Device,
  ): Trampoline<Element<N>> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      Node.fromNode(child, device),
    ).map((children) => {
      const element = Element.of(
        Option.from(json.namespace as Namespace | null),
        Option.from(json.prefix),
        json.name,
        json.attributes.map((attribute) =>
          Attribute.fromAttribute(attribute).run(),
        ),
        children,
        json.style?.length === 0
          ? None
          : Option.from(json.style).map(Block.from),
        Option.from(json.box).map(Rectangle.from),
        Option.from(device),
        json.externalId,
        json.serializationId,
      );

      if (json.shadow !== null) {
        element._attachShadow(Shadow.fromShadow(json.shadow, device).run());
      }

      if (json.content !== null) {
        element._attachContent(
          Document.fromDocument(json.content, device).run(),
        );
      }

      return element;
    });
  }

  /**
   * @internal
   */
  export function cloneElement(
    options: Node.ElementReplacementOptions,
    device?: Device,
  ): (element: Element) => Trampoline<Element> {
    return (element) =>
      Trampoline.traverse(element.children(), (child) => {
        if (Element.isElement(child) && options.predicate(child)) {
          return Trampoline.done(Array.from(options.newElements));
        }

        return Node.cloneNode(child, options, device).map((node) => [node]);
      }).map((children) => {
        const deviceOption = Option.from(device);
        const clonedElement = Element.of(
          element.namespace,
          element.prefix,
          element.name,
          element.attributes.map((attribute) =>
            Attribute.clone(attribute, options, device),
          ),
          Iterable.flatten(children),
          element.style.map((block) => {
            return Block.of(
              Iterable.map(block.declarations, (declaration) =>
                Declaration.of(
                  declaration.name,
                  declaration.value,
                  declaration.important,
                ),
              ),
            );
          }),
          deviceOption.flatMap((d) => element.getBoundingBox(d)),
          deviceOption,
          element.externalId,
          element.serializationId,
          element.extraData,
        );

        if (element.shadow.isSome()) {
          clonedElement._attachShadow(
            Shadow.clone(element.shadow.get(), options, device),
          );
        }

        if (element.content.isSome()) {
          clonedElement._attachContent(
            Document.clone(element.content.get(), options, device),
          );
        }

        return clonedElement;
      });
  }

  export const {
    hasAttribute,
    hasBox,
    hasDisplaySize,
    hasId,
    hasInputType,
    hasName,
    hasNamespace,
    hasTabIndex,
    hasUniqueId,
    isBrowsingContextContainer,
    isContent,
    isActuallyDisabled,
    isDocumentElement,
    isDraggable,
    isEditingHost,
    isFallback,
    isScopedTo,
    isSuggestedFocusable,
    isReplaced,
  } = predicate;

  export const { inputType } = helpers;

  export type InputType = helpers.InputType;
}
