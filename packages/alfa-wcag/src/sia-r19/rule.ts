import { Atomic } from "@siteimprove/alfa-act";
import { Attributes } from "@siteimprove/alfa-aria";
import {
  Attribute,
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { URL, values } from "@siteimprove/alfa-util";

function concat<T>(a: Array<T>, b: Array<T>): Array<T> {
  return a.concat(b);
}

export const SIA_R19: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r19.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    applicability(document, () =>
      querySelectorAll<Element>(
        document,
        document,
        node => isElement(node) && isHtmlOrSvgElement(node, document)
      )
        .map(element =>
          Array.from(element.attributes).filter(
            attribute =>
              attributeNames.has(attribute.localName) &&
              attribute.value.trim() !== ""
          )
        )
        .reduce(concat, [])
    );

    expectations((aspect, target, expectation) => {
      const attribute = values(Attributes).find(
        attribute => attribute.name === target.localName
      )!;
      const { value } = target;

      let valid = true;

      switch (attribute.type) {
        case "true-false":
          valid = value === "true" || value === "false";
          break;

        case "true-false-undefined":
          valid =
            value === "true" || value === "false" || value === "undefined";
          break;

        case "tristate":
          valid = value === "true" || value === "false" || value === "mixed";
          break;

        case "integer":
          valid = /^\d+$/.test(value);
          break;

        case "number":
          valid = /^\d+(\.\d+)?$/.test(value);
          break;

        case "token":
          valid =
            attribute.values!.find(found => found === value) !== undefined;
          break;

        case "token-list":
          valid =
            value
              .split(/\s+/)
              .find(
                found =>
                  attribute.values!.find(value => value === found) === undefined
              ) === undefined;
          break;

        case "uri":
          try {
            new URL(value);
          } catch (err) {
            valid = false;
          }
      }

      expectation(1, valid);
    });
  }
};

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  const namespace = getElementNamespace(element, context);

  return namespace === Namespace.HTML || namespace === Namespace.SVG;
}
