import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#timer
 */
Role.register(
  Role.of("timer", Role.Category.LiveRegion, {
    inherits: ["status"],
    name: { from: ["author"], required: true }
  })
);
