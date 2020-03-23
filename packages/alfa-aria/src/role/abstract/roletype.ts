import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#roletype
 */
Role.register(
  Role.of("roletype", Role.Category.Abstract, {
    supports: [
      "aria-atomic",
      "aria-busy",
      "aria-controls",
      "aria-current",
      "aria-describedby",
      "aria-details",
      "aria-disabled",
      "aria-dropeffect",
      "aria-errormessage",
      "aria-flowto",
      "aria-grabbed",
      "aria-haspopup",
      "aria-hidden",
      "aria-invalid",
      "aria-keyshortcuts",
      "aria-label",
      "aria-labelledby",
      "aria-live",
      "aria-owns",
      "aria-relevant",
      "aria-roledescription",
    ],
  })
);
