import { Err, Ok } from "@siteimprove/alfa-result";
import { Diagnostic } from "@siteimprove/alfa-act";
import { Property } from "@siteimprove/alfa-style";

export function TextSpacing(name: Property.Name) {
  return {
    NotImportant: Ok.of(
      Diagnostic.of(`The \`${name}\` property is not !important`)
    ),

    AboveMinimum: Ok.of(
      Diagnostic.of(`The \`${name}\` property is above the required minimum`)
    ),

    Cascaded: Ok.of(
      Diagnostic.of(`The \`${name}\` property is cascaded from another element`)
    ),

    Important: Err.of(
      Diagnostic.of(`The \`${name}\` property is !important and too small`)
    ),
  };
}
