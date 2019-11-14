import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#marquee
 */
Role.register(
  Role.of("marquee", Role.Category.LiveRegion, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
