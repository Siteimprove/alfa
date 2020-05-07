import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#window
 */
Role.register(
  Role.of("window", Role.Category.Abstract, {
    inherits: ["roletype"],
    supports: ["aria-expanded", "aria-modal"],
  })
);
