import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#status
 */
Role.register(
  Role.of("status", Role.Category.LiveRegion, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false
    },
    implicits: [["aria-Live", "polite"], ["aria-Atomic", "true"]]
  })
);
