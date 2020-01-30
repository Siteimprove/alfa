import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { clamp } from "@siteimprove/alfa-math";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectations/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";

const { filter } = Iterable;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r47.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          document.descendants(),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML)),
              and(
                hasName(equals("meta")),
                and(
                  hasAttribute("name", equals("viewport")),
                  hasAttribute("content")
                )
              )
            )
          )
        );
      },

      expectations(target) {
        const whitespace = [" ", "\xa0", "\t", "\n", "\f", "\r", "\v"];
        const separator = [",", ";"];
        const equal = ["="];
        const properties = parsePropertiesList(
          target.attribute("content").get().value,
          whitespace,
          separator,
          equal
        );

        const scale = parseMaximumScale(properties.get("maximum-scale"));
        const scalable = parseUserScalable(properties.get("user-scalable"));

        return {
          1: expectation(
            scale.every(scale => scale >= 2) &&
              scalable.every(scalable => scalable !== "fixed"),
            Outcomes.MetaDoesNotPreventZoom,
            Outcomes.MedatDoesPreventZoom
          )
        };
      }
    };
  }
});

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
export function parsePropertiesList(
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

      if (value.length > 0) {
        valueMap.set(name, value);
      }
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
export function parseMaximumScale(scale: string | undefined): Option<number> {
  switch (scale) {
    case undefined:
      return None;
    case "yes":
      return Option.of(1);
    case "device-width":
    case "device-height":
      return Option.of(10);
    case "no":
      return Option.of(0.1);
    default:
      const scaleValue = Number(scale);
      return Option.of(isNaN(scaleValue) ? 0.1 : clamp(scaleValue, 0.1, 10));
  }
}

/*
 * Parses a "user-scalable" property according to https://www.w3.org/TR/css-device-adapt-1/#user-scalable
 *
 * @remark
 * This seems to be the iOS/Safari algorithm and other browsers might handle it in unknown ways.
 */
export function parseUserScalable(
  scalable: string | undefined
): Option<"zoom" | "fixed"> {
  switch (scalable) {
    case undefined:
      return None;
    case "yes":
    case "device-width":
    case "device-height":
      return Option.of("zoom");
    case "no":
      return Option.of("fixed");
    default:
      const scalableValue = Number(scalable);
      return Option.of(
        scalableValue <= -1 || scalableValue >= 1 ? "zoom" : "fixed"
      );
  }
}

export namespace Outcomes {
  export const MetaDoesNotPreventZoom = Ok.of(
    "The <meta> element does not restrict the ability to zoom"
  );

  export const MedatDoesPreventZoom = Err.of(
    "The <meta> element restricts the ability to zoom"
  );
}
