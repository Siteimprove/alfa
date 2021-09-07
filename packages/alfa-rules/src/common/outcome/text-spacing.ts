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

    GoodText: Ok.of(
      Diagnostic.of(
        `All text nodes have their \`${name}\` property either wide-enough or not cascaded from the target`
      )
    ),

    Important: Err.of(
      Diagnostic.of(`The \`${name}\` property is !important and too small`)
    ),
  };
}
