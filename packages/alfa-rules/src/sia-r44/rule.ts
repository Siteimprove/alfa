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
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isElement } = Element;
const { some } = Iterable;
const { abs, acos, PI } = Math;
const { or } = Predicate;
const { hasComputedStyle, isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r44",
  requirements: [Criterion.of("1.3.4")],
  tags: [Scope.Component],
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
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(isVisible(device))
          .filter(
            or(
              hasConditionalRotation(landscape),
              hasConditionalRotation(portrait)
            )
          );
      },

      expectations(target) {
        const rotation = getRelativeRotation(target, landscape, portrait).map(
          (rotation) => Real.round(rotation)
        );

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

function hasConditionalRotation(device: Device): Predicate<Element> {
  return hasComputedStyle(
    "transform",
    (value, source) => {
      if (Keyword.isKeyword(value) || source.none(isOrientationConditional)) {
        return false;
      }

      return some(
        value,
        (transform) =>
          transform.kind === "rotate" || transform.kind === "matrix"
      );
    },
    device
  );
}

function isOrientationConditional(declaration: Declaration): boolean {
  return some(
    declaration.ancestors(),
    (rule) =>
      MediaRule.isMediaRule(rule) &&
      some(rule.queries.queries, (query) =>
        query.condition.some(hasOrientationCondition)
      )
  );
}

function hasOrientationCondition(
  condition: Media.Feature | Media.Condition
): boolean {
  for (const feature of condition) {
    if (
      feature.name === "orientation" &&
      feature.value.some(
        (value) =>
          value.matches(Keyword.of("landscape")) ||
          value.matches(Keyword.of("portrait"))
      )
    ) {
      return true;
    }
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
          const { x, y, angle } = fn;

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
