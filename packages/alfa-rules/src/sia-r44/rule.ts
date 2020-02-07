import { Rule } from "@siteimprove/alfa-act";
import { Transformation } from "@siteimprove/alfa-affine";
import { Keyword } from "@siteimprove/alfa-css";
import { Device, Viewport } from "@siteimprove/alfa-device";
import { Declaration, Element, MediaRule } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { mod, round } from "@siteimprove/alfa-math";
import { Media } from "@siteimprove/alfa-media";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { isVisible } from "../common/predicate/is-visible";

const { abs, acos, PI } = Math;
const { filter, some } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r44.html",
  evaluate({ device, document }) {
    let landscape: Device;
    let portrait: Device;

    if (device.viewport.orientation === Viewport.Orientation.Landscape) {
      landscape = device;
      portrait = Device.of(
        device.type,
        Viewport.of(
          device.viewport.width,
          device.viewport.height,
          Viewport.Orientation.Portrait
        ),
        device.display
      );
    } else {
      portrait = device;
      landscape = Device.of(
        device.type,
        Viewport.of(
          device.viewport.width,
          device.viewport.height,
          Viewport.Orientation.Landscape
        ),
        device.display
      );
    }

    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              isVisible(device),
              element =>
                hasConditionalRotation(element, landscape) ||
                hasConditionalRotation(element, portrait)
            )
          )
        );
      },

      expectations(target) {
        const rotation = getRelativeRotation(
          target,
          landscape,
          portrait
        ).map(rotation => round(rotation));

        return {
          1: expectation(
            rotation.every(rotation => rotation !== 90 && rotation !== 270),
            Outcomes.RotationNotLocked,
            Outcomes.RotationLocked
          )
        };
      }
    };
  }
});

function hasConditionalRotation(element: Element, device: Device): boolean {
  const { value, source } = Style.from(element, device).computed("transform");

  if (source.isNone()) {
    return false;
  }

  if (Keyword.isKeyword(value) || source.some(not(isOrientationConditional))) {
    return false;
  }

  for (const transform of value) {
    switch (transform.name) {
      case "rotate":
      case "matrix":
        return true;
    }
  }

  return false;
}

function isOrientationConditional(declaration: Declaration): boolean {
  return some(declaration.ancestors(), rule => {
    if (MediaRule.isMedia(rule)) {
      for (const media of Media.parse(rule.condition)) {
        for (const { condition } of media) {
          if (condition.isSome()) {
            if (hasOrientationCondition(condition.get())) {
              return true;
            }
          }
        }
      }
    }

    return false;
  });
}

function hasOrientationCondition(
  condition: Media.Feature | Media.Condition | Media.Negation
): boolean {
  if (Media.isFeature(condition)) {
    if (
      condition.name === "orientation" &&
      condition.value.some(equals("landscape", "portrait"))
    ) {
      return true;
    }
  }

  if (Media.isCondition(condition)) {
    return (
      hasOrientationCondition(condition.left) ||
      hasOrientationCondition(condition.left)
    );
  }

  if (Media.isNegation(condition)) {
    return hasOrientationCondition(condition.condition);
  }

  return false;
}

function getRotation(element: Element, device: Device): Option<number> {
  const rotation = element.parent().isNone()
    ? Option.of(0)
    : element
        .parent()
        .filter(Element.isElement)
        .flatMap(parent => getRotation(parent, device));

  return rotation.flatMap(rotation => {
    const transform = Style.from(element, device).computed("transform").value;

    if (Keyword.isKeyword(transform)) {
      return Option.of(rotation);
    }

    for (const fn of transform) {
      switch (fn.name) {
        case "rotate": {
          const [x, y, z, angle] = fn.args;

          z;

          if (x !== 0 || y !== 0) {
            return None;
          }

          rotation += angle.value;

          break;
        }

        case "matrix": {
          const decomposed = Transformation.decompose(fn.args);

          if (decomposed.isNone()) {
            continue;
          }

          const [x, y, , w] = decomposed.get().rotate;

          if (x !== 0 || y !== 0) {
            return None;
          }

          const angle = (2 * acos(w) * 180) / PI;

          rotation += angle;
        }
      }
    }

    return Option.of(mod(rotation, 360));
  });
}

function getRelativeRotation(
  element: Element,
  left: Device,
  right: Device
): Option<number> {
  return getRotation(element, left).flatMap(left =>
    getRotation(element, right).map(right => mod(abs(left - right), 360))
  );
}

export namespace Outcomes {
  export const RotationNotLocked = Ok.of(
    "The element is not orientation locked"
  );

  export const RotationLocked = Err.of("The element is orientation locked");
}
