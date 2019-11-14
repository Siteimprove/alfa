import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#select
 */
Role.register(
  Role.of("select", Role.Category.Abstract, {
    inherits: ["composite", "group"],
    supports: ["aria-orientation"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
