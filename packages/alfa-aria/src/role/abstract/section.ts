import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#section
 */
Role.register(
  Role.of("section", Role.Category.Abstract, {
    inherits: ["structure"],
    supports: ["aria-expanded"]
  })
);
