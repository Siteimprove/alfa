import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Transformation } from "@siteimprove/alfa-affine";
import { Keyword } from "@siteimprove/alfa-css";
import { Device, Viewport } from "@siteimprove/alfa-device";
import {
  Declaration,
  Element,
  MediaRule,
  Node,
  Query,
} from "@siteimprove/alfa-dom";
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
const { getElementDescendants } = Query;

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
        return getElementDescendants(document, Node.fullTree)
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

/**
 * @public
 */
export namespace Outcomes {
  export const RotationNotLocked = Ok.of(
    Diagnostic.of(`The element is not locked in orientation`)
  );

  export const RotationLocked = Err.of(
    Diagnostic.of(`The element is locked in orientation`)
  );
}

function hasConditionalRotation(device: Device): Predicate<Element> {
  return or(
    hasComputedStyle(
      "transform",
      (value, source) =>
        // The only keyword value is "none", which is no rotation
        !Keyword.isKeyword(value) &&
        source.some(isOrientationConditional) &&
        some(
          value,
          (transform) =>
            transform.kind === "rotate" || transform.kind === "matrix"
        ),
      device
    ),
    hasComputedStyle(
      "rotate",
      (value, source) =>
        // The only keyword value is "none", which is no rotation
        !Keyword.isKeyword(value) && source.some(isOrientationConditional),
      device
    )
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
  const parent = element.parent(Node.flatTree).filter(isElement);

  const rotation = parent.isNone()
    ? Option.of(0)
    : parent.flatMap((parent) => getRotation(parent, device));

  return rotation.flatMap((rotation) => {
    const style = Style.from(element, device);
    // rotate is applied before transform,
    // see https://w3c.github.io/csswg-drafts/css-transforms-2/#ctm
    const rotate = style.computed("rotate").value;

    if (!Keyword.isKeyword(rotate)) {
      const { x, y, angle } = rotate;

      if (x.value !== 0 || y.value !== 0) {
        // If the rotation is not purely around the z axis, we bail out immediately
        // and do not try to see what it looks like.
        // This may lead to incorrect results if the x/y rotation is cancelled
        // by a counter-rotation.
        return None;
      }

      rotation += angle.value;
    }

    const transform = style.computed("transform").value;

    if (Keyword.isKeyword(transform)) {
      return Option.of(rotation);
    }

    for (const fn of transform) {
      switch (fn.kind) {
        case "rotate": {
          const { x, y, angle } = fn;

          if (x.value !== 0 || y.value !== 0) {
            // If the rotation is not purely around the z axis, we bail out immediately
            // and do not try to see what it looks like.
            // This may lead to incorrect results if the x/y rotation is cancelled
            // by a counter-rotation.
            return None;
          }

          rotation += angle.value;

          break;
        }

        case "matrix": {
          const decomposed = Transformation.of(
            fn.values.map((row) => row.map((number) => number.value))
          ).decompose();

          if (!decomposed.isSome()) {
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
