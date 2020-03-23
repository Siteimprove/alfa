import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#contentinfo
 */
Role.register(
  Role.of("contentinfo", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: { from: ["author"], required: false },
  })
);
