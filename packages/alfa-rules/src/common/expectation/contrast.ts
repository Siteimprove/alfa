import { Cache } from "@siteimprove/alfa-cache";
import { RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Set } from "@siteimprove/alfa-set";
import { Iterable } from "@siteimprove/alfa-iterable";

import { expectation } from "../act/expectation";
import { Group } from "../act/group";
import { Question } from "../act/question";
import { Contrast as Diagnostic } from "../diagnostic/contrast";
import { ColorError, getBackground, getForeground } from "../dom/get-colors";
import { Contrast as Outcomes } from "../outcome/contrast";
import { isLargeText } from "../predicate";

const { isElement } = Element;
const { flatMap, map, takeWhile } = Iterable;
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
  // Associated Applicability should ensure that target have Element as parent.
  // Additionally, stray text nodes should not exist in our use case and we'd
  // rather crash if finding one.
  const parent = target.parent(Node.flatTree).getUnsafe() as Element;

  const foregrounds = Question.of("foreground-colors", target).answerIf(
    getForeground(parent, device)
  );
  const backgrounds = Question.of("background-colors", target).answerIf(
    getBackground(parent, device)
  );

  const threshold = isLargeText(device)(target)
    ? largeTextThreshold
    : normalTextThreshold;

  return {
    1: foregrounds.map((foregrounds) =>
      backgrounds.map((backgrounds) => {
        const { pairings, highest } = getPairings(foregrounds, backgrounds);

        return expectation(
          // Accept if  single pairing is good enough.
          highest >= threshold,
          () => Outcomes.HasSufficientContrast(highest, threshold, pairings),
          () => Outcomes.HasInsufficientContrast(highest, threshold, pairings)
        );
      })
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
  // Associated Applicability should ensure that target have Element as parent.
  // Additionally, stray text nodes should not exist in our use case and we'd
  // rather crash if finding one.
  const parent = target.parent(Node.flatTree).getUnsafe() as Element;

  // We try to compute foreground and background colors first.
  // If they resolve correctly, we're happy and do not need to ask anything.
  // But if they do have interposed descendants, we need to ask which ones to
  // ignore, and recompute colors.
  // When no interposed descendants are encountered, the second call to
  // getBackground/getForeground should trigger a cache hit and be cheap since
  // Set.empty() is a static value.

  const foreground = getForeground(parent, device)
    // if we cannot resolve automatically
    .err()
    .map((errors) =>
      flatMap(
        // We only keep the initial "interposed-descendants" problems. As soon as we
        // encounter some other problem, the "ignored-interposed-elements" question
        // won't solve it, and we'll ask for colors anyway. So there is no need to ask
        // "ignored-interposed-elements" for them.
        takeWhile(errors.errors, ColorError.isInterposedDescendants),
        // and keep the interposed elements.
        (error) => error.positionedDescendants
      )
    )
    .getOr<Array<Element>>([]);
  const background = getBackground(parent, device)
    .err()
    .map((errors) =>
      flatMap(
        takeWhile(errors.errors, ColorError.isInterposedDescendants),
        (error) => error.positionedDescendants
      )
    )
    .getOr<Array<Element>>([]);

  // We use a set to dedupe elements, it is likely that the same are interposed
  // for foreground and background.
  const interposedDescendants = Set.from(foreground).concat(background);

  const ignoredInterposedElements = Question.of(
    "ignored-interposed-elements",
    Group.of(interposedDescendants),
    target
  ).answerIf(interposedDescendants.isEmpty(), []);

  const foregrounds = Question.of("foreground-colors", target);
  const backgrounds = Question.of("background-colors", target);

  const threshold = isLargeText(device)(target)
    ? largeTextThreshold
    : normalTextThreshold;

  return {
    1: ignoredInterposedElements.map((ignored) => {
      const ignoredInterposed = Set.from(ignored).filter(isElement);

      return foregrounds
        .answerIf(getForeground(parent, device, undefined, ignoredInterposed))
        .map((foregrounds) =>
          backgrounds
            .answerIf(
              getBackground(
                parent,
                device,
                undefined,
                undefined,
                ignoredInterposed
              )
            )
            .map((backgrounds) => {
              const { pairings, highest } = getPairings(
                foregrounds,
                backgrounds
              );

              return expectation(
                // Accept if  single pairing is good enough.
                highest >= threshold,
                () =>
                  Outcomes.HasSufficientContrast(highest, threshold, pairings),
                () =>
                  Outcomes.HasInsufficientContrast(highest, threshold, pairings)
              );
            })
        );
    }),
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
