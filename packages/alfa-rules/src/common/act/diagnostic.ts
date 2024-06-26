import * as languages from "../../sia-r109/rule.js";
import * as labelAndName from "../../sia-r14/rule.js";
import * as roleAndRequiredAttributes from "../../sia-r16/rule.js";
import * as withRoleAndName from "../../sia-r55/rule.js";
import * as sameNames from "../../sia-r56/rule.js";
import * as withFirstHeading from "../../sia-r61/rule.js";
import * as distinguishingStyles from "../../sia-r62/diagnostics.js";
import * as matchingClasses from "../../sia-r65/diagnostics.js";
import * as withDeclaration from "../../sia-r75/rule.js";
import * as clippingAncestors from "../../sia-r83/rule.js";

// R66, R69
import * as colorError from "../dom/get-colors.js";

// R17, R70, R90, R95, R42, R60, R68, R76, R91, R92, R93
import * as diagnostic from "../../common/diagnostic.js";

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
