import { Atomic } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

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
              getAttribute(node, "name").toLowerCase() === "viewport" &&
              getAttribute(node, "content") !== null
            );
          })
        ).map(elt => {
          return { applicable: true, aspect: document, target: elt };
        });
      },

      expectations: (aspect, target) => {
        const whitespace = [" "]; // todo: complete list
        const separator = [",", ";"];
        const equal = ["="];
        const properties = parsePropertiesList(
          getAttribute(target, "content"),
          whitespace,
          separator,
          equal
        );

        const scale = parseMaximumScale(properties["maximum-scale"]);
        const scalable = parseUserScalable(properties["user-scalable"]);

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
 * parse a list of "name=value" properties according to https://drafts.csswg.org/css-device-adapt/#parsing-algorithm
 * Note that this seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 * Note that the algorithm considers "foo bar =  = === foobar" as a valid string for "foo=foobar"
 *
 * @propertiesList: the list to be parsed
 * @ignored: list of characters that are ignored (considered as whitespace)
 * @separator: list of characters that are allowed to separate "name=value" pairs
 * @equal: list of characters that are considered as equal sign
 *
 * @return an object where each correctly formed "name=value" pair is a {name: value} property
 */
function parsePropertiesList(
  propertiesList: string,
  ignored: Array<string>,
  separator: Array<string>,
  equal: Array<string>
): { [name: string]: string } {
  const valueObj: { [name: string]: string } = {};

  const allSpecial = ignored.concat(separator, equal);
  const separatorAndEqual = separator.concat(equal);
  const notSeparator = ignored.concat(equal);

  const len = propertiesList.length;
  let i = 0;
  let start: number;
  let name: string;
  let value: string;
  while (i < len) {
    // find the start of the next name
    while (i < len && allSpecial.includes(propertiesList[i])) {
      i++;
    }
    // parse the name of the property
    start = i;
    while (i < len && !allSpecial.includes(propertiesList[i])) {
      i++;
    }
    name = propertiesList.substring(start, i);
    // find a separator (end of property) or equal sign
    while (i < len && !separatorAndEqual.includes(propertiesList[i])) {
      i++;
    }
    // skip all further ignored or equal characters
    while (i < len && notSeparator.includes(propertiesList[i])) {
      i++;
    }
    // if we are hitting a separator, the current property has just a name and no value, move on
    if (separator.includes(propertiesList[i])) {
      valueObj[name] = null;
    } else {
      // parse the value of the property
      start = i;
      while (i < len && !allSpecial.includes(propertiesList[i])) {
        i++;
      }
      value = propertiesList.substring(start, i);

      valueObj[name] = value;
    }
  }

  return valueObj;
}

/*
 * parse a "maximum-scale" property according to https://www.w3.org/TR/css-device-adapt-1/#min-scale-max-scale
 * Note that this seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
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
      return isNaN(scaleValue) ? 0.1 : Math.max(0.1, Math.min(scaleValue, 10));
  }
}

/*
 * parse a "user-scalable" property according to https://www.w3.org/TR/css-device-adapt-1/#user-scalable
 * Note that this seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 */
function parseUserScalable(scalable: string | undefined): string {
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
