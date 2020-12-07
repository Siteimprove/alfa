import { Err, Ok } from "@siteimprove/alfa-result";
import { Diagnostic } from "@siteimprove/alfa-act";
import { Property } from "@siteimprove/alfa-style";

export const Outcomes = (name: Property.Name) => ({
  notImportant: Ok.of(
    Diagnostic.of(`The \`${name}\` property is not !important`)
  ),

  aboveMinimum: Ok.of(
    Diagnostic.of(`The \`${name}\` property is above the required minimum`)
  ),

  cascaded: Ok.of(
    Diagnostic.of(`The \`${name}\` property is cascaded from another element`)
  ),

  important: Err.of(
    Diagnostic.of(`The \`${name}\` property is !important and too small`)
  ),
});
