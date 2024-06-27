import { Contrast as Diagnostic } from "../diagnostic/contrast.js";
import { Err, Ok } from "@siteimprove/alfa-result";

export namespace Contrast {
  export const HasSufficientContrast = (
    highest: number,
    threshold: number,
    pairings: Array<Diagnostic.Pairing<["foreground", "background"]>>,
  ) =>
    Ok.of(
      Diagnostic.of(
        `The highest possible contrast of the text is ${highest}:1 which is
        above the required contrast of ${threshold}:1`,
        threshold,
        pairings,
      ),
    );

  export const HasInsufficientContrast = (
    highest: number,
    threshold: number,
    pairings: Array<Diagnostic.Pairing<["foreground", "background"]>>,
  ) =>
    Err.of(
      Diagnostic.of(
        `The highest possible contrast of the text is ${highest}:1 which is
        below the required contrast of ${threshold}:1`,
        threshold,
        pairings,
      ),
    );
}
