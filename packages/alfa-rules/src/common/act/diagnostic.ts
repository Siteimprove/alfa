import * as deprecatedDistinguishingStyles from "../../sia-dr62/rule";
import * as languages from "../../sia-r109/rule";
import * as labelAndName from "../../sia-r14/rule";
import * as roleAndRequiredAttributes from "../../sia-r16/rule";
import * as withPreviousHeading from "../../sia-r53/rule";
import * as withRoleAndName from "../../sia-r55/rule";
import * as sameNames from "../../sia-r56/rule";
import * as withFirstHeading from "../../sia-r61/rule";
import * as distinguishingStyles from "../../sia-r62/diagnostics";
import * as matchingClasses from "../../sia-r65/diagnostics";
import * as withDeclaration from "../../sia-r75/rule";
import * as withNextHeading from "../../sia-r78/rule";
import * as clippingAncestors from "../../sia-r83/rule";

// R66, R69
import * as colorError from "../dom/get-colors";

// R17, R70, R90, R95, R42, R60, R68, R76, R91, R92, R93
import * as diagnostic from "../../common/diagnostic";

/**
 * @public
 */
export namespace Diagnostic {
  export const { DistinguishingStyles: DeprecatedDistinguishingStyles } =
    deprecatedDistinguishingStyles;
  export const { Languages } = languages;
  export const { LabelAndName } = labelAndName;
  export const { RoleAndRequiredAttributes } = roleAndRequiredAttributes;
  export const { WithPreviousHeading } = withPreviousHeading;
  export const { WithRoleAndName } = withRoleAndName;
  export const { SameNames } = sameNames;
  export const { WithFirstHeading } = withFirstHeading;
  export const { DistinguishingStyles } = distinguishingStyles;
  export const { ColorError } = colorError;
  export const { MatchingClasses } = matchingClasses;
  export const { WithDeclaration } = withDeclaration;
  export const { WithNextHeading } = withNextHeading;
  export const { ClippingAncestors } = clippingAncestors;
  export const { Contrast, TextSpacing, WithBadElements, WithRole } =
    diagnostic;

  export const { isDistinguishingStyles: isDistinguishingStylesDeprecated } =
    DistinguishingStyles;
  export const { isLanguages } = Languages;
  export const { isLabelAndName } = LabelAndName;
  export const { isRoleAndRequiredAttributes } = RoleAndRequiredAttributes;
  export const { isWithPreviousHeading } = WithPreviousHeading;
  export const { isWithRoleAndName } = WithRoleAndName;
  export const { isSameNames } = SameNames;
  export const { isWithFirstHeading } = WithFirstHeading;
  export const { isDistinguishingStyles } = DistinguishingStyles;
  export const {
    isColorError,
    isInterposedDescendants: isColorErrorInterposedDescendants,
    isUnresolvableGradientStop: isColorErrorUnresolvableGradientStop,
    isWithProperty: isColorErrorWithProperty,
  } = ColorError;
  export const { isMatchingClasses } = MatchingClasses;
  export const { isWithDeclaration } = WithDeclaration;
  export const { isWithNextHeading } = WithNextHeading;
  export const { isClippingAncestors } = ClippingAncestors;
  export const { isContrast } = Contrast;
  export const { isTextSpacing } = TextSpacing;
  export const { isWithBadElements } = WithBadElements;
  export const { isWithRole } = WithRole;
}
