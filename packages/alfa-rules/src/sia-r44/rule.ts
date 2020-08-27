import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Transformation } from "@siteimprove/alfa-affine";
import { Keyword } from "@siteimprove/alfa-css";
import { Device, Viewport } from "@siteimprove/alfa-device";
import { Declaration, Element, MediaRule } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Real } from "@siteimprove/alfa-math";
import { Media } from "@siteimprove/alfa-media";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { isVisible } from "../common/predicate/is-visible";

const { abs, acos, PI } = Math;
const { some } = Iterable;
const { and, not } = Predicate;

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
        return document.descendants({ flattened: true, nested: true }).filter(
          and(
            Element.isElement,
            and<Element>(
              isVisible(device),
              (element) =>
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
        ).map((rotation) => Real.round(rotation));

        return {
          1: expectation(
            rotation.every((rotation) => rotation !== 90 && rotation !== 270),
            () => Outcomes.RotationNotLocked,
            () => Outcomes.RotationLocked
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const RotationNotLocked = Ok.of(
    Diagnostic.of(`The element is not locked in orientation`)
  );

  export const RotationLocked = Err.of(
    Diagnostic.of(`The element is locked in orientation`)
  );
}

function hasConditionalRotation(element: Element, device: Device): boolean {
  const { value, source } = Style.from(element, device).computed("transform");

  if (source.isNone()) {
    return false;
  }

  if (Keyword.isKeyword(value) || source.some(not(isOrientationConditional))) {
    return false;
  }

  for (const transform of value) {
    switch (transform.kind) {
      case "rotate":
      case "matrix":
        return true;
    }
  }

  return false;
}

function isOrientationConditional(declaration: Declaration): boolean {
  return some(declaration.ancestors(), (rule) => {
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
      condition.value.some(
        (value) =>
          value.type === "string" &&
          (value.value === "landscape" || value.value === "portrait")
      )
    ) {
      return true;
    }
  }

  if (Media.isCondition(condition)) {
    return (
      hasOrientationCondition(condition.left) ||
      hasOrientationCondition(condition.right)
    );
  }

  if (Media.isNegation(condition)) {
    return hasOrientationCondition(condition.condition);
  }

  return false;
}

function getRotation(element: Element, device: Device): Option<number> {
  const parent = element.parent({ flattened: true }).filter(Element.isElement);

  const rotation = parent.isNone()
    ? Option.of(0)
    : parent.flatMap((parent) => getRotation(parent, device));

  return rotation.flatMap((rotation) => {
    const transform = Style.from(element, device).computed("transform").value;

    if (Keyword.isKeyword(transform)) {
      return Option.of(rotation);
    }

    for (const fn of transform) {
      switch (fn.kind) {
        case "rotate": {
          const { x, y, z, angle } = fn;

          z;

          if (x.value !== 0 || y.value !== 0) {
            return None;
          }

          rotation += angle.value;

          break;
        }

        case "matrix": {
          const decomposed = Transformation.of(
            fn.values.map((row) => row.map((number) => number.value))
          ).decompose();

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

    return Option.of(Real.modulo(rotation, 360));
  });
}

function getRelativeRotation(
  element: Element,
  left: Device,
  right: Device
): Option<number> {
  return getRotation(element, left).flatMap((left) =>
    getRotation(element, right).map((right) =>
      Real.modulo(abs(left - right), 360)
    )
  );
}
