import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#range
 */
Role.register(
  Role.of("range", Role.Category.Abstract, {
    inherits: ["widget"],
    supports: [
      "aria-valuemax",
      "aria-valuemin",
      "aria-valuenow",
      "aria-valuetext"
    ],
    name: {
      from: ["author"],
      required: false
    }
  })
);
