import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#gridcell
 */
Role.register(
  Role.of("gridcell", Role.Category.Widget, {
    inherits: ["cell", "widget"],
    supports: ["aria-readonly", "aria-required", "aria-selected"],
    context: ["row"],
    name: {
      from: ["contents", "author"],
      required: true
    }
  })
);
