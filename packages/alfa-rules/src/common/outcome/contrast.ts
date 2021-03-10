import { Contrast as Diagnostic } from "../diagnostic/contrast";
import { Err, Ok } from "@siteimprove/alfa-result";

export namespace Contrast {
  export const HasSufficientContrast = (
    highest: number,
    threshold: number,
    pairings: Array<Diagnostic.Pairing>
  ) =>
    Ok.of(
      Diagnostic.of(
        `The highest possible contrast of the text is 1:${highest} which is
        above the required contrast of 1:${threshold}`,
        threshold,
        pairings
      )
    );

  export const HasInsufficientContrast = (
    highest: number,
    threshold: number,
    pairings: Array<Diagnostic.Pairing>
  ) =>
    Err.of(
      Diagnostic.of(
        `The highest possible contrast of the text is 1:${highest} which is
        below the required contrast of 1:${threshold}`,
        threshold,
        pairings
      )
    );
}
