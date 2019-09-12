import { Atomic } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  hasAttribute,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { clamp } from "@siteimprove/alfa-util";

export const SIA_R47: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r47.html",
  requirements: [
    { requirement: "wcag", criterion: "resize-text", partial: true }
  ],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(document, document, node => {
            return (
              isElement(node) &&
              isMeta(node, document) &&
              getAttribute(node, "name", { lowerCase: true }) === "viewport" &&
              hasAttribute(node, "content")
            );
          })
        ).map(element => {
          return { applicable: true, aspect: document, target: element };
        });
      },

      expectations: (aspect, target) => {
        const whitespace = [" "]; // todo: complete list
        const separator = [",", ";"];
        const equal = ["="];
        const properties = parsePropertiesList(
          getAttribute(target, "content")!,
          whitespace,
          separator,
          equal
        );

        const scale = parseMaximumScale(properties.get("maximum-scale"));
        const scalable = parseUserScalable(properties.get("user-scalable"));

        return {
          1: { holds: scale >= 2 && scalable !== "fixed" }
        };
      }
    };
  }
};

function isMeta(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return element.localName === "meta";
}

/*
 * Parses a list of "name=value" properties according to https://drafts.csswg.org/css-device-adapt/#parsing-algorithm
 *
 * @remarks
 * This seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 * The algorithm considers "foo bar =  = === foobar" as a valid string for "foo=foobar"
 *
 * @param propertiesList - The list to be parsed
 * @param ignored - A list of characters that are ignored (considered as whitespace)
 * @param separator - A list of characters that are allowed to separate "name=value" pairs
 * @param equal - A list of characters that are considered as equal sign
 * @returns a Map where each correctly formed "name=value" pair has a "name" key with value "value"
 */
function parsePropertiesList(
  propertiesList: string,
  ignored: Array<string>,
  separator: Array<string>,
  equal: Array<string>
): Map<string, string> {
  const valueMap = new Map<string, string>();

  const sepSet = new Set(separator);
  const allSpecial = new Set([...ignored, ...separator, ...equal]);
  const separatorAndEqual = new Set([...separator, ...equal]);
  const notSeparator = new Set([...ignored, ...equal]);

  const { length } = propertiesList;
  let i = 0;
  let start: number;
  let name: string;
  let value: string;
  while (i < length) {
    // find the start of the next name
    while (i < length && allSpecial.has(propertiesList[i])) {
      i++;
    }
    // parse the name of the property
    start = i;
    while (i < length && !allSpecial.has(propertiesList[i])) {
      i++;
    }
    name = propertiesList.substring(start, i);
    // find a separator (end of property) or equal sign
    while (i < length && !separatorAndEqual.has(propertiesList[i])) {
      i++;
    }
    // skip all further ignored or equal characters
    while (i < length && notSeparator.has(propertiesList[i])) {
      i++;
    }
    // if we are hitting a separator, the current property has just a name and no value, move on
    if (!sepSet.has(propertiesList[i])) {
      // parse the value of the property
      start = i;
      while (i < length && !allSpecial.has(propertiesList[i])) {
        i++;
      }
      value = propertiesList.substring(start, i);

      valueMap.set(name, value);
    }
  }

  return valueMap;
}

/*
 * Parses a "maximum-scale" property according to https://www.w3.org/TR/css-device-adapt-1/#min-scale-max-scale
 *
 * @remarks
 * This seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 */
function parseMaximumScale(scale: string | undefined): number {
  switch (scale) {
    case undefined:
      return 0.1;
    case "yes":
      return 1;
    case "device-width":
    case "device-height":
      return 10;
    case "no":
      return 0.1;
    default:
      const scaleValue = Number(scale);
      return isNaN(scaleValue) ? 0.1 : clamp(scaleValue, 0.1, 10);
  }
}

/*
 * Parses a "user-scalable" property according to https://www.w3.org/TR/css-device-adapt-1/#user-scalable
 *
 * @remark
 * This seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 */
function parseUserScalable(scalable: string | undefined): "zoom" | "fixed" {
  switch (scalable) {
    case undefined:
      return "fixed";
    case "yes":
    case "device-width":
    case "device-height":
      return "zoom";
    case "no":
      return "fixed";
    default:
      const scalableValue = Number(scalable);
      return scalableValue <= -1 || scalableValue >= 1 ? "zoom" : "fixed";
  }
}
