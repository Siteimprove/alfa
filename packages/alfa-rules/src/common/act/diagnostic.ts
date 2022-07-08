import { DistinguishingStyles } from "../../sia-r62/diagnostics";
import { Languages } from "../../sia-r109/rule";
import { LabelAndName } from "../../sia-r14/rule";
import { RoleAndRequiredAttributes } from "../../sia-r16/rule";
import { SameNames } from "../../sia-r56/rule";
import { MatchingClasses } from "../../sia-r65/diagnostics";
import { DistinguishingStyles as DeprecatedDistinguishingStyles } from "../../sia-dr62/rule";
import { DeprecatedElements } from "../../sia-r70/rule";
import { WithDeclaration } from "../../sia-r75/rule";
import { ClippingAncestors } from "../../sia-r83/rule";

// R66, R69
import { Contrast } from "../diagnostic/contrast";
import { ColorError } from "../dom/get-colors";

// R42, R55, R68
import { WithRole } from "../diagnostic/with-role";

/**
 * @public
 */
export namespace Diagnostic {
  export const { isClippingAncestors } = ClippingAncestors;

  export const {
    isColorError,
    isInterposedDescendants: isColorErrorInterposedDescendants,
    isUnresolvableGradientStop: isColorErrorUnresolvableGradientStop,
    isWithProperty: isColorErrorWithProperty,
  } = ColorError;

  export const { isContrast } = Contrast;

  export const { isDeprecatedElements } = DeprecatedElements;

  export const { isDistinguishingStyles } = DistinguishingStyles;

  export const { isDistinguishingStyles: isDistinguishingStylesDeprecated } =
    DeprecatedDistinguishingStyles;

  export const { isMatchingClasses } = MatchingClasses;

  export const { isLabelAndName } = LabelAndName;

  export const { isLanguages } = Languages;

  export const { isRoleAndRequiredAttributes } = RoleAndRequiredAttributes;

  export const { isSameNames } = SameNames;

  export const { isWithDeclaration } = WithDeclaration;

  export const { isWithRole } = WithRole;
}
