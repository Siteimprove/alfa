import { Diagnostic, Outcome } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Percentage, RGB } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import ER62 from "../../src/sia-er62/rule";
import { Contrast } from "../../src/common/diagnostic/contrast";
import {
  DistinguishingStyles,
  ElementDistinguishable,
} from "../../src/sia-er62/diagnostics";

export function addCursor(
  style: Result<ElementDistinguishable>
): Result<ElementDistinguishable> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props
      .withStyle(["cursor", "pointer"])
      .withDistinguishingProperties(["cursor"])
  );
}
export function addOutline(
  style: Result<ElementDistinguishable>
): Result<ElementDistinguishable> {
  return (style.isOk() ? style : Ok.of(style.getErr())).map((props) =>
    props
      .withStyle(["outline", "auto"])
      .withDistinguishingProperties(["outline"])
  );
}

export function getContainerColor(color: RGB): Contrast.Color {
  return Contrast.Color.of("container", color);
}

export function getLinkColor(color: RGB): Contrast.Color {
  return Contrast.Color.of("link", color);
}

export function sortContrastPairings(
  outcomes: Iterable<Outcome<Page, Element<string>, never, Element<string>>>,
  target: Element
) {
  const sortedOutcomes = Iterable.map(outcomes, (outcome) => {
    if (Outcome.Passed.isPassed(outcome) || Outcome.Failed.isFailed(outcome)) {
      const expectations: Iterable<
        [string, Option<Result<Diagnostic, Diagnostic>>]
      > = Iterable.map(outcome.expectations.entries(), ([key, result]) => {
        return [
          key,
          Option.of(
            result.map((distinguishingStyles) => {
              if (
                DistinguishingStyles.isDistinguishingStyles(
                  distinguishingStyles
                )
              ) {
                function sortByContrast(
                  pairings: ReadonlyArray<Contrast.Pairing>
                ): ReadonlyArray<Contrast.Pairing> {
                  return Array.sortWith(
                    [...pairings],
                    (a, b) => b.contrast - a.contrast
                  );
                }
                const defaultStyles = Iterable.map(
                  distinguishingStyles.defaultStyles,
                  (defaultStyle) =>
                    defaultStyle.map(
                      ({ distinguishingProperties, style, pairings }) =>
                        ElementDistinguishable.of(
                          distinguishingProperties,
                          style,
                          sortByContrast(pairings)
                        )
                    )
                );

                const hoverStyles = Iterable.map(
                  distinguishingStyles.hoverStyles,
                  (hoverStyle) =>
                    hoverStyle.map(
                      ({ distinguishingProperties, style, pairings }) =>
                        ElementDistinguishable.of(
                          distinguishingProperties,
                          style,
                          sortByContrast(pairings)
                        )
                    )
                );

                const focusStyles = Iterable.map(
                  distinguishingStyles.focusStyles,
                  (focusStyle) =>
                    focusStyle.map(
                      ({ distinguishingProperties, style, pairings }) =>
                        ElementDistinguishable.of(
                          distinguishingProperties,
                          style,
                          sortByContrast(pairings)
                        )
                    )
                );
                return DistinguishingStyles.of(
                  distinguishingStyles.message,
                  defaultStyles,
                  hoverStyles,
                  focusStyles
                );
              }
              return distinguishingStyles;
            })
          ),
        ];
      });
      return Outcome.from(ER62, target, Record.from(expectations));
    }
    return outcome;
  });

  return Array.of(...sortedOutcomes).map((outcome) => outcome.toJSON());
}

export namespace Defaults {
  // default styling of links
  // The initial value of border-top is medium, resolving as 3px. However, when
  // computing and border-style is none, this is computed as 0px.
  // As a consequence, even without changing `border` at all, the computed value
  // of border-top is not equal to its initial value and needs to expressed here!
  //
  // Confused? Wait, same joke happens for outline-width except that now on focus
  // outline-style is not none, so the computed value of outline-width is its
  // initial value. As a consequence, we cannot just override properties since
  // in this case we need to actually *remove* outline-width from the diagnostic!

  export const defaultLinkColor = RGB.of(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0.9333333),
    Percentage.of(1)
  );

  export const defaultTextColor = RGB.of(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(1)
  );

  export const defaultContrastPairings = [
    Contrast.Pairing.of(
      getContainerColor(defaultTextColor),
      getLinkColor(defaultLinkColor),
      2.23
    ),
  ];

  export const noDistinguishingProperties = ElementDistinguishable.of(
    [],
    [
      ["border-width", "0px"],
      ["font", "16px serif"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["outline", "0px"],
    ],
    defaultContrastPairings
  );

  export const linkProperties = noDistinguishingProperties
    .withStyle(["text-decoration", "underline"])
    .withDistinguishingProperties(["text-decoration"]);

  export const defaultStyle = Ok.of(linkProperties);
  export const hoverStyle = addCursor(defaultStyle);
  export const focusStyle = addOutline(defaultStyle);

  export const noStyle = Err.of(noDistinguishingProperties);
}
