import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#structure
 */
Role.register(
  Role.of("structure", Role.Category.Abstract, {
    inherits: ["roletype"],
  })
);
