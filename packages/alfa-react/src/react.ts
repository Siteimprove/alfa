import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  Node,
  Text,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { isValidElement, ReactElement } from "react";
import * as TestRenderer from "react-test-renderer";

const { keys } = Object;
const { isBoolean, isObject, isString } = Predicate;

export namespace React {
  export type Type = ReactElement<unknown>;

  export function isType(value: unknown): value is Type {
    return isObject(value) && isValidElement(value);
  }

  export function asPage(value: Type): Page {
    const tree = TestRenderer.create(value).toJSON();

    if (tree === null) {
      throw new Error("Could not render React element");
    }

    const children = (Array.isArray(tree) ? tree : [tree]).map((element) =>
      Element.from(toElement(element))
    );

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of(children),
      Device.standard()
    );
  }
}

type TestNode = TestElement | string;

type TestElement = TestRenderer.ReactTestRendererJSON;

function toNode(node: TestNode): Node.JSON {
  return isString(node) ? toText(node) : toElement(node);
}

function toElement(element: TestElement): Element.JSON {
  const { type: name, props, children } = element;

  const attributes = keys(props).reduce<Array<Attribute.JSON>>(
    (attributes, prop) => {
      for (const attribute of toAttribute(prop, props[prop])) {
        attributes.push(attribute);
      }

      return attributes;
    },
    []
  );

  return {
    type: "element",
    namespace: Namespace.HTML,
    prefix: null,
    name,
    attributes,
    style: null,
    children: children?.map(toNode) ?? [],
    shadow: null,
    content: null,
  };
}

function toAttribute(name: string, value: unknown): Option<Attribute.JSON> {
  switch (value) {
    // Attributes that are either `null` or `undefined` are always ignored.
    case null:
    case undefined:
      return None;
  }

  name = toAttributeName(name);

  return toAttributeValue(name, value).map((value) => {
    return {
      type: "attribute",
      namespace: null,
      prefix: null,
      name,
      value,
    };
  });
}

function toAttributeName(name: string): string {
  switch (name) {
    case "className":
      return "class";

    case "htmlFor":
      return "for";
  }

  return name;
}

function toAttributeValue(name: string, value: unknown): Option<string> {
  switch (name) {
    case "style":
      if (isObject(value)) {
        return Option.of(toInlineStyle(value));
      }
  }

  if (name.startsWith("aria-") && isBoolean(value)) {
    return Option.of(String(value));
  }

  switch (value) {
    case false:
      return None;

    case true:
      return Option.of(name);
  }

  return Option.of(String(value));
}

function toText(data: string): Text.JSON {
  return {
    type: "text",
    data,
  };
}

function toInlineStyle(props: { [key: string]: unknown }): string {
  let style = "";
  let delimiter = "";

  for (const prop of keys(props)) {
    if (props[prop]) {
      style += prop.replace(/([A-Z])/g, "-$1").toLowerCase();
      style += ": ";
      style += String(props[prop]).trim();
      style += delimiter;

      delimiter = ";";
    }
  }

  return style;
}
