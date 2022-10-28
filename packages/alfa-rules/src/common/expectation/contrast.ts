import { Cache } from "@siteimprove/alfa-cache";
import { RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";

import { expectation } from "../act/expectation";
import { Question } from "../act/question";
import { Contrast as Diagnostic } from "../diagnostic/contrast";
import { getBackground, getForeground } from "../dom/get-colors";
import { Contrast as Outcomes } from "../outcome/contrast";
import { isLargeText } from "../predicate";

const { flatMap, map } = Iterable;
const { min, max, round } = Math;

/**
 * @internal
 */
export function hasSufficientContrast(
  target: Text,
  device: Device,
  largeTextThreshold: number,
  normalTextThreshold: number
) {
  const foregrounds = Question.of("foreground-colors", target);
  const backgrounds = Question.of("background-colors", target);

  const result = foregrounds.map((foregrounds) =>
    backgrounds.map((backgrounds) => {
      const { pairings, highest } = getPairings(foregrounds, backgrounds);

      const threshold = isLargeText(device)(target)
        ? largeTextThreshold
        : normalTextThreshold;

      return expectation(
        // Accept if  single pairing is good enough.
        highest >= threshold,
        () => Outcomes.HasSufficientContrast(highest, threshold, pairings),
        () => Outcomes.HasInsufficientContrast(highest, threshold, pairings)
      );
    })
  );

  // Associated Applicability should ensure that target have Element as parent.
  // Additionally, stray text nodes should not exist in our use case and we'd
  // rather crash if finding one.
  const parent = target.parent(Node.flatTree).getUnsafe() as Element;

  return {
    1: result
      .answerIf(getForeground(parent, device))
      .map((askBackground) =>
        askBackground.answerIf(getBackground(parent, device))
      ),
  };
}

/**
 * @internal
 */
export function hasSufficientContrastExperimental(
  target: Text,
  device: Device,
  largeTextThreshold: number,
  normalTextThreshold: number
) {
  const foregrounds = Question.of("foreground-colors", target);
  const backgrounds = Question.of("background-colors", target);

  const result = foregrounds.map((foregrounds) =>
    backgrounds.map((backgrounds) => {
      const { pairings, highest } = getPairings(foregrounds, backgrounds);

      const threshold = isLargeText(device)(target)
        ? largeTextThreshold
        : normalTextThreshold;

      return expectation(
        // Accept if  single pairing is good enough.
        highest >= threshold,
        () => Outcomes.HasSufficientContrast(highest, threshold, pairings),
        () => Outcomes.HasInsufficientContrast(highest, threshold, pairings)
      );
    })
  );

  // Associated Applicability should ensure that target have Element as parent.
  // Additionally, stray text nodes should not exist in our use case and we'd
  // rather crash if finding one.
  const parent = target.parent(Node.flatTree).getUnsafe() as Element;

  return {
    1: result
      .answerIf(getForeground(parent, device))
      .map((askBackground) =>
        askBackground.answerIf(getBackground(parent, device))
      ),
  };
}

interface Pairings {
  pairings: Array<Diagnostic.Pairing<["foreground", "background"]>>;
  highest: number;
}

const cache = Cache.empty<Iterable<RGB>, Cache<Iterable<RGB>, Pairings>>();

/**
 * For each FG and each BG color, compute the contrast and store the pairing
 */
function getPairings(
  foregrounds: Iterable<RGB>,
  backgrounds: Iterable<RGB>
): Pairings {
  return cache.get(foregrounds, Cache.empty).get(backgrounds, () => {
    const pairings = [
      ...flatMap(foregrounds, (foreground) =>
        map(backgrounds, (background) =>
          Diagnostic.Pairing.of<["foreground", "background"]>(
            ["foreground", foreground],
            ["background", background],
            contrast(foreground, background)
          )
        )
      ),
    ];

    const highest = pairings.reduce(
      (highest, pairing) => max(highest, pairing.contrast),
      0
    );

    return { pairings, highest };
  });
}

/**
 * {@link https://w3c.github.io/wcag/guidelines/#dfn-relative-luminance}
 */
function luminance(color: RGB): number {
  const [red, green, blue] = [color.red, color.green, color.blue].map((c) => {
    const component = c.type === "number" ? c.value / 0xff : c.value;

    return component <= 0.03928
      ? component / 12.92
      : Math.pow((component + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * {@link https://w3c.github.io/wcag/guidelines/#dfn-contrast-ratio}
 *
 * @internal
 */
export function contrast(foreground: RGB, background: RGB): number {
  const lf = luminance(foreground);
  const lb = luminance(background);

  const contrast = (max(lf, lb) + 0.05) / (min(lf, lb) + 0.05);

  return round(contrast * 100) / 100;
}
