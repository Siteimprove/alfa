import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Real } from "@siteimprove/alfa-math";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAttribute, hasName, hasNamespace } = Element;
const { and, equals } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r47",
  requirements: [
    Criterion.of("1.4.4"),
    // The 1.4.10 secondary mapping is missing in ACT rules
    // https://github.com/act-rules/act-rules.github.io/issues/2025
    // Commenting it out as it would otherwise invalidate our implementation
    // in the reports.
    // Criterion.of("1.4.10"),
  ],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ document }) {
    let maximumScaleMap = Map.empty<Element, number>();
    let userScalableMap = Map.empty<Element, "zoom" | "fixed">();

    return {
      applicability() {
        return (
          getElementDescendants(document)
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("meta"),
                hasAttribute("name", equals("viewport")),
                hasAttribute("content"),
              ),
            )
            // Compute the required properties and register them, reject the
            // element if none are defined.
            .filter((meta) => {
              const properties = parsePropertiesList(
                // The previous filter ensures there is a content.
                meta.attribute("content").getUnsafe().value.toLowerCase(),
              );

              const scale = parseMaximumScale(properties.get("maximum-scale"));
              const scalable = parseUserScalable(
                properties.get("user-scalable"),
              );

              // Since we look at each `<meta>` once, no need to check for
              // pre-existing key in the Maps.
              scale.forEach((scale) => {
                maximumScaleMap = maximumScaleMap.set(meta, scale);
              });
              scalable.forEach((scalable) => {
                userScalableMap = userScalableMap.set(meta, scalable);
              });

              return scale.or(scalable).isSome();
            })
        );
      },

      expectations(target) {
        return {
          1: expectation(
            maximumScaleMap.get(target).every((scale) => scale >= 2) &&
              userScalableMap
                .get(target)
                .every((scalable) => scalable !== "fixed"),
            () => Outcomes.MetaDoesNotPreventZoom,
            () => Outcomes.MetaDoesPreventZoom,
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const MetaDoesNotPreventZoom = Ok.of(
    Diagnostic.of(
      `The \`<meta>\` element does not restrict the ability to zoom`,
    ),
  );

  export const MetaDoesPreventZoom = Err.of(
    Diagnostic.of(`The \`<meta>\` element restricts the ability to zoom`),
  );
}

/**
 * Parses a list of "name=value" properties.
 *
 * {@link https://www.w3.org/TR/css-device-adapt-1/#parsing-algorithm}
 *
 * @remarks
 * This seems to be the iOS/Safari algorithm and other browsers might handle it
 * in unknown ways. The algorithm considers "foo bar =  = === foobar" as a valid
 * string for "foo=foobar"
 */
function parsePropertiesList(propertiesList: string): Map<string, string> {
  let valueMap = Map.empty<string, string>();

  const whitespace = [" ", "\xa0", "\t", "\n", "\f", "\r", "\v"];
  const separator = [",", ";"];
  const equal = ["="];

  const sepSet = Set.from(separator);
  const allSpecial = Set.of(...whitespace, ...separator, ...equal);
  const separatorAndEqual = Set.of(...separator, ...equal);
  const notSeparator = Set.of(...whitespace, ...equal);

  const { length } = propertiesList;
  let i = 0;
  let start: number;
  let name: string;
  let value: string;
  while (i < length) {
    // Find the start of the next name
    while (i < length && allSpecial.has(propertiesList[i])) {
      i++;
    }

    // Parse the name of the property
    start = i;

    while (i < length && !allSpecial.has(propertiesList[i])) {
      i++;
    }

    name = propertiesList.substring(start, i);

    // Find a separator (end of property) or equal sign
    while (i < length && !separatorAndEqual.has(propertiesList[i])) {
      i++;
    }

    // Skip all further ignored or equal characters
    while (i < length && notSeparator.has(propertiesList[i])) {
      i++;
    }

    // If we are hitting a separator, the current property has just a name and
    // no value, move on
    if (!sepSet.has(propertiesList[i])) {
      // Parse the value of the property
      start = i;

      while (i < length && !allSpecial.has(propertiesList[i])) {
        i++;
      }

      value = propertiesList.substring(start, i);

      if (value.length > 0) {
        valueMap = valueMap.set(name, value);
      }
    }
  }

  return valueMap;
}

/**
 * Parse a "maximum-scale" property.
 *
 * {@link https://www.w3.org/TR/css-device-adapt-1/#min-scale-max-scale}
 *
 * @remarks
 * This seems to be the iOS/Safari algorithm and other browsers might handle it
 * in unknown ways.
 */
function parseMaximumScale(scale: Option<string>): Option<number> {
  return scale.flatMap((scale) => {
    switch (scale) {
      case "yes":
        return Option.of(1);

      case "device-width":
      case "device-height":
        return Option.of(10);

      case "no":
        return Option.of(0.1);

      default:
        const scaleValue = Number(scale);

        if (scaleValue < 0) {
          return None;
        }

        return Option.of(
          isNaN(scaleValue) ? 0.1 : Real.clamp(scaleValue, 0.1, 10),
        );
    }
  });
}

/**
 * Parse a "user-scalable" property according.
 *
 * {@link https://www.w3.org/TR/css-device-adapt-1/#user-scalable}
 *
 * @remark
 * This seems to be the iOS/Safari algorithm and other browsers might handle it
 * in unknown ways.
 */
function parseUserScalable(scalable: Option<string>): Option<"zoom" | "fixed"> {
  return scalable.map((scalable) => {
    switch (scalable) {
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
  });
}
