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
  export import Languages = languages.Languages;
  export import LabelAndName = labelAndName.LabelAndName;
  export import RoleAndRequiredAttributes = roleAndRequiredAttributes.RoleAndRequiredAttributes;
  export import WithPreviousHeading = withPreviousHeading.WithPreviousHeading;
  export import WithRoleAndName = withRoleAndName.WithRoleAndName;
  export import SameNames = sameNames.SameNames;
  export import WithFirstHeading = withFirstHeading.WithFirstHeading;
  export import DistinguishingStyles = distinguishingStyles.DistinguishingStyles;
  export import ColorErrors = colorError.ColorErrors;
  export import MatchingClasses = matchingClasses.MatchingClasses;
  export import WithDeclaration = withDeclaration.WithDeclaration;
  export import WithNextHeading = withNextHeading.WithNextHeading;
  export import ClippingAncestors = clippingAncestors.ClippingAncestors;
  export import Constrast = diagnostic.Contrast;
  export import TextSpacing = diagnostic.TextSpacing;
  export import WithBadElements = diagnostic.WithBadElements;
  export import WithRole = diagnostic.WithRole;
}
