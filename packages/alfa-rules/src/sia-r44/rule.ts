import { Atomic } from "@siteimprove/alfa-act";
import { decompose } from "@siteimprove/alfa-affine";
import { MediaCondition, parseMediaQuery, Values } from "@siteimprove/alfa-css";
import { Device, Orientation } from "@siteimprove/alfa-device";
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
import { mod, round, values } from "@siteimprove/alfa-util";

const { isArray } = Array;
const { isString } = Values;
const { abs, acos, PI } = Math;

export const SIA_R44: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r44.html",
  requirements: [
    { requirement: "wcag", criterion: "orientation", partial: true }
  ],
  evaluate: ({ device, document }) => {
    let devices: { landscape: Device; portrait: Device };

    if (device.viewport.orientation === Orientation.Landscape) {
      devices = {
        landscape: device,
        portrait: {
          ...device,
          viewport: {
            ...device.viewport,
            orientation: Orientation.Portrait
          }
        }
      };
    } else {
      devices = {
        portrait: device,
        landscape: {
          ...device,
          viewport: {
            ...device.viewport,
            orientation: Orientation.Landscape
          }
        }
      };
    }

    return {
      applicability: () => {
        return [
          ...querySelectorAll<Element>(document, document, node => {
            if (!isElement(node) || !isVisible(node, document, device)) {
              return false;
            }

            for (const device of values(devices)) {
              if (hasConditionalRotation(node, document, device)) {
                return true;
              }
            }

            return false;
          })
        ].map(element => {
          return {
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        let rotation = getRelativeRotation(target, document, devices);

        if (rotation !== null) {
          rotation = round(rotation);
        }

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
      if (
        feature.name === "orientation" &&
        feature.value !== undefined &&
        isString(feature.value)
      ) {
        const { value } = feature.value;

        if (value === "landscape" || value === "portrait") {
          return true;
        }
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
      case "rotate": {
        const [x, y, z, angle] = value.args;

        z;

        if (x.value !== 0 || y.value !== 0) {
          return null;
        }

        rotation += angle.value;

        break;
      }

      case "matrix": {
        const { args } = value;

        const decomposed = decompose([
          [args[0].value, args[4].value, args[8].value, args[12].value],
          [args[1].value, args[5].value, args[9].value, args[13].value],
          [args[2].value, args[6].value, args[10].value, args[14].value],
          [args[3].value, args[7].value, args[11].value, args[15].value]
        ]);

        if (decomposed === null) {
          continue;
        }

        const [x, y, z, w] = decomposed.rotate;

        z;

        if (x !== 0 || y !== 0) {
          return null;
        }

        const angle = (2 * acos(w) * 180) / PI;

        rotation += angle;
      }
    }
  }

  return mod(parentRotation + rotation, 360);
}

function getRelativeRotation(
  element: Element,
  context: Node,
  devices: { landscape: Device; portrait: Device }
): number | null {
  const rotations = {
    landscape: getRotation(element, context, devices.landscape),
    portrait: getRotation(element, context, devices.portrait)
  };

  if (rotations.landscape === null || rotations.portrait === null) {
    return null;
  }

  return mod(abs(rotations.landscape - rotations.portrait), 360);
}
