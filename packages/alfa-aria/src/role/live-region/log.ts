import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#log
 */
Role.register(
  Role.of("log", Role.Category.LiveRegion, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: true
    },
    implicits: [["aria-Live", "polite"]]
  })
);
