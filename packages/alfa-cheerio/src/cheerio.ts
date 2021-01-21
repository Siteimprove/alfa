import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Element,
  Node,
  Text,
  Document,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as cheerio from "cheerio";
import * as dom from "domhandler";

const { keys } = Object;

export namespace Cheerio {
  // The Cheerio typings are somewhat unfortunately written as they don't expose
  // the "Cheerio" type as an export. We can however extract it from the top-
  // level "cheerio" export as it's a selector function that returns objects of
  // type "Cheerio".
  export type Type = ReturnType<typeof import("cheerio")>;

  export function isType(value: unknown): value is Type {
    return value instanceof cheerio;
  }

  export function asPage(value: Type): Page {
    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Node.from(toNode(value[0]))]),
      Device.standard()
    );
  }
}

function toNode(node: dom.Node): Node.JSON {
  switch (node.type) {
    case "text":
      return toText(node as dom.Text);

    default:
      return toElement(node as dom.Element);
  }
}

function toElement(element: dom.Element): Element.JSON {
  const { name, attribs, childNodes } = element;

  const attributes = keys(attribs).map((localName) => {
    return toAttribute(localName, attribs[localName]);
  });

  const children = childNodes.map(toNode);

  return {
    type: "element",
    namespace: Namespace.HTML,
    prefix: null,
    name,
    attributes,
    style: null,
    children,
    shadow: null,
    content: null,
  };
}

function toAttribute(name: string, value: string): Attribute.JSON {
  return {
    type: "attribute",
    namespace: null,
    prefix: null,
    name,
    value,
  };
}

function toText(text: dom.Text): Text.JSON {
  return {
    type: "text",
    data: text.nodeValue,
  };
}
