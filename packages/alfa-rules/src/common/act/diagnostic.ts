import { LabelAndName } from "../../sia-r14/rule";
import { RoleAndRequiredAttributes } from "../../sia-r16/rule";
import { WithPreviousHeading } from "../../sia-r53/rule";
import { WithRoleAndName } from "../../sia-r55/rule";
import { SameNames } from "../../sia-r56/rule";
import { WithFirstHeading } from "../../sia-r61/rule";
import { DistinguishingStyles } from "../../sia-r62/diagnostics";
import { DistinguishingStyles as DeprecatedDistinguishingStyles } from "../../sia-dr62/rule";
import { MatchingClasses } from "../../sia-r65/diagnostics";
import { WithDeclaration } from "../../sia-r75/rule";
import { WithNextHeading } from "../../sia-r78/rule";
import { ClippingAncestors } from "../../sia-r83/rule";
import { Languages } from "../../sia-r109/rule";

// R17, R70, R90, R95
import { WithBadElements } from "../diagnostic/with-bad-elements";

// R42, R60, R68, R76
import { WithRole } from "../diagnostic/with-role";

// R66, R69
import { Contrast } from "../diagnostic/contrast";
import { ColorError } from "../dom/get-colors";

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

  export const { isDistinguishingStyles } = DistinguishingStyles;

  export const { isDistinguishingStyles: isDistinguishingStylesDeprecated } =
    DeprecatedDistinguishingStyles;

  export const { isMatchingClasses } = MatchingClasses;

  export const { isLabelAndName } = LabelAndName;

  export const { isLanguages } = Languages;

  export const { isRoleAndRequiredAttributes } = RoleAndRequiredAttributes;

  export const { isSameNames } = SameNames;

  export const { isWithBadElements } = WithBadElements;

  export const { isWithDeclaration } = WithDeclaration;

  export const { isWithFirstHeading } = WithFirstHeading;

  export const { isWithNextHeading } = WithNextHeading;

  export const { isWithPreviousHeading } = WithPreviousHeading;

  export const { isWithRole } = WithRole;

  export const { isWithRoleAndName } = WithRoleAndName;
}
