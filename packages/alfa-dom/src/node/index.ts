import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Refinement } from "@siteimprove/alfa-refinement";
import type { Trampoline } from "@siteimprove/alfa-trampoline";

import { BaseNode as BaseNode } from "./node.ts";

import { Attribute } from "./attribute.ts";
import { Comment } from "./comment.ts";
import { Document } from "./document.ts";
import { Shadow } from "./shadow.ts";
import { Element, Text } from "./slotable/index.ts";
import { Fragment } from "./fragment.ts";
import { Type } from "./type.ts";

import * as predicate from "./predicate/index.ts";
import * as traversal from "./traversal/index.ts";

const { or } = Refinement;

export * from "./attribute.ts";
export * from "./comment.ts";
export * from "./document.ts";
export * from "./shadow.ts";
export * from "./slotable/index.ts";
// Load the element specific augments.
import "./element/augment.js";
export * from "./fragment.ts";
export * from "./type.ts";

/** @public */
export type Node =
  | Attribute
  | Comment
  | Document
  | Element
  | Fragment
  | Shadow
  | Type
  | Text;

/**
 * @public
 */
export namespace Node {
  export type JSON =
    | Attribute.JSON
    | Comment.JSON
    | Document.JSON
    | Element.JSON
    | Fragment.JSON
    | Shadow.JSON
    | Type.JSON
    | Text.JSON;

  export const isNode: Refinement<unknown, Node> = or(
    Attribute.isAttribute,
    or(
      Comment.isComment,
      or(
        Document.isDocument,
        or(
          Element.isElement,
          or(
            Fragment.isFragment,
            or(Shadow.isShadow, or(Type.isType, Text.isText)),
          ),
        ),
      ),
    ),
  );

  export type SerializationOptions = BaseNode.SerializationOptions;

  export import Traversal = BaseNode.Traversal;
  export const flatTree: Traversal = BaseNode.flatTree;
  export const fullTree: Traversal = BaseNode.fullTree;
  export const composedNested: Traversal = BaseNode.composedNested;

  const cacheWithDevice = Cache.empty<JSON, Cache<Device, Node>>();
  const cacheWithoutDevice = Cache.empty<JSON, Node>();

  export function from(json: Element.JSON, device?: Device): Element;

  export function from(json: Attribute.JSON, device?: Device): Attribute;

  export function from(json: Text.JSON, device?: Device): Text;

  export function from(json: Comment.JSON, device?: Device): Comment;

  export function from(json: Document.JSON, device?: Device): Document;

  export function from(json: Type.JSON, device?: Device): Document;

  export function from(json: Fragment.JSON, device?: Device): Fragment;

  export function from(json: JSON, device?: Device): Node;

  export function from(json: JSON, device?: Device): Node {
    return device === undefined
      ? cacheWithoutDevice.get(json, () => fromNode(json, device).run())
      : cacheWithDevice
          .get(json, Cache.empty)
          .get(device, () => fromNode(json, device).run());
  }

  /**
   * @internal
   */
  export function fromNode(json: JSON, device?: Device): Trampoline<Node> {
    switch (json.type) {
      case "element":
        return Element.fromElement(json as Element.JSON, fromNode, device);

      case "attribute":
        return Attribute.fromAttribute(json as Attribute.JSON);

      case "text":
        return Text.fromText(json as Text.JSON, device);

      case "comment":
        return Comment.fromComment(json as Comment.JSON);

      case "document":
        return Document.fromDocument(json as Document.JSON, fromNode, device);

      case "type":
        return Type.fromType(json as Type.JSON);

      case "fragment":
        return Fragment.fromFragment(json as Fragment.JSON, fromNode, device);

      default:
        throw new Error(`Unexpected node of type: ${json.type}`);
    }
  }

  export const getNodesBetween = traversal.getNodesBetween(Traversal.empty);

  export const { hasBox, isRoot } = predicate;

  export const hasChild = predicate.hasChild(Traversal.empty);
  export const hasDescendant = predicate.hasDescendant(Traversal.empty);
  export const hasInclusiveDescendant = predicate.hasInclusiveDescendant(
    Traversal.empty,
  );
  export const hasTextContent = predicate.hasTextContent(Traversal.empty);
}
