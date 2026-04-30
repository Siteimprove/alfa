import * as languages from "../../sia-r109/rule.ts";
import * as labelAndName from "../../sia-r14/rule.ts";
import * as roleAndRequiredAttributes from "../../sia-r16/rule.ts";
import * as withRoleAndName from "../../sia-r55/rule.ts";
import * as sameNames from "../../sia-r56/rule.ts";
import * as withFirstHeading from "../../sia-r61/rule.ts";
import * as distinguishingStyles from "../../sia-r62/diagnostics.ts";
import * as matchingClasses from "../../sia-r65/diagnostics.ts";
import * as withDeclaration from "../../sia-r75/rule.ts";
import * as clippingAncestors from "../../sia-dr83/rule.ts";

// R66, R69
import * as colorError from "../dom/get-colors.ts";

// R17, R70, R90, R95, R42, R60, R68, R76, R91, R92, R93
import * as diagnostic from "../../common/diagnostic.ts";

/**
 * @public
 */
export namespace Diagnostic {
  export import Languages = languages.Languages;
  export import LabelAndName = labelAndName.LabelAndName;
  export import RoleAndRequiredAttributes = roleAndRequiredAttributes.RoleAndRequiredAttributes;
  export import WithRoleAndName = withRoleAndName.WithRoleAndName;
  export import SameNames = sameNames.SameNames;
  export import WithFirstHeading = withFirstHeading.WithFirstHeading;
  export import DistinguishingStyles = distinguishingStyles.DistinguishingStyles;
  export import ElementDistinguishable = distinguishingStyles.ElementDistinguishable;
  export import ColorError = colorError.ColorError;
  export import ColorErrors = colorError.ColorErrors;
  export import MatchingClasses = matchingClasses.MatchingClasses;
  export import WithDeclaration = withDeclaration.WithDeclaration;
  export import ClippingAncestors = clippingAncestors.ClippingAncestors;
  export import Contrast = diagnostic.Contrast;
  export import TextSpacing = diagnostic.TextSpacing;
  export import WithBadElements = diagnostic.WithBadElements;
  export import WithRole = diagnostic.WithRole;
  export import WithName = diagnostic.WithName;
  export import WithOtherHeading = diagnostic.WithOtherHeading;
  export import WithBoundingBox = diagnostic.WithBoundingBox;
}
