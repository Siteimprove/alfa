import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#widget
 */
Role.register(
  Role.of("widget", Role.Category.Abstract, {
    inherits: ["roletype"],
  })
);
