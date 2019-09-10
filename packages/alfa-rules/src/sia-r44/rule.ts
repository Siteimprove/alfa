import { Atomic } from "@siteimprove/alfa-act";
import { MediaCondition, parseMediaQuery, Values } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getComputedStyle,
  getParentElement,
  getParentRule,
  getPropertyValue,
  isElement,
  isMediaRule,
  isVisible,
  Node,
  querySelectorAll,
  Rule
} from "@siteimprove/alfa-dom";
import { mod } from "@siteimprove/alfa-util";

const { isArray } = Array;

export const SIA_R44: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r44.html",
  requirements: [
    { requirement: "wcag", criterion: "orientation", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return [
          ...querySelectorAll<Element>(document, document, node => {
            if (!isElement(node) || !isVisible(node, document, device)) {
              return false;
            }

            return hasConditionalRotation(node, document, device);
          })
        ].map(element => {
          return {
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target, question) => {
        const rotation = getRotation(target, document, device);

        return {
          1: {
            holds: rotation === null || (rotation !== 90 && rotation !== 270)
          }
        };
      }
    };
  }
};

function hasConditionalRotation(
  element: Element,
  context: Node,
  device: Device
): boolean {
  const { transform } = getComputedStyle(element, context, device);

  if (transform === undefined) {
    return false;
  }

  const { value, source } = transform;

  if (source === null || Values.isKeyword(value, "none")) {
    return false;
  }

  if (!isOrientationConditional(source, context)) {
    return false;
  }

  for (const { value: transform } of value.value) {
    switch (transform.name) {
      case "rotate":
      case "matrix":
        return true;
    }
  }

  return false;
}

function isOrientationConditional(rule: Rule, context: Node): boolean {
  if (isMediaRule(rule)) {
    let mediaQueries = parseMediaQuery(rule.conditionText);

    if (mediaQueries !== null) {
      mediaQueries = isArray(mediaQueries) ? mediaQueries : [mediaQueries];

      for (const { condition } of mediaQueries) {
        if (condition === undefined) {
          continue;
        }

        if (hasOrientationCondition(condition)) {
          return true;
        }
      }
    }

    // Media rules are not allowed to nest, so at this point we don't need to
    // look further up the tree.
    return false;
  }

  const parentRule = getParentRule(rule, context);

  if (parentRule === null) {
    return false;
  }

  return isOrientationConditional(parentRule, context);
}

function hasOrientationCondition(condition: MediaCondition): boolean {
  for (const feature of condition.features) {
    if ("features" in feature) {
      if (hasOrientationCondition(feature)) {
        return true;
      }
    } else {
      if (feature.name === "orientation") {
        return true;
      }
    }
  }

  return false;
}

function getRotation(
  element: Element,
  context: Node,
  device: Device
): number | null {
  const parentElement = getParentElement(element, context);

  const parentRotation =
    parentElement === null ? 0 : getRotation(parentElement, context, device);

  if (parentRotation === null) {
    return null;
  }

  const transform = getPropertyValue(
    getComputedStyle(element, context, device),
    "transform"
  );

  if (transform === null || Values.isKeyword(transform, "none")) {
    return parentRotation;
  }

  let rotation = 0;

  for (const { value } of transform.value) {
    switch (value.name) {
      case "rotate":
        rotation += value.args[0].value;
    }
  }

  return mod(parentRotation + rotation, 360);
}
