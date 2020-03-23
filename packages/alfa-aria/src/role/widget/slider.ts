import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#slider
 */
Role.register(
  Role.of("slider", Role.Category.Widget, {
    inherits: ["input", "range"],
    requires: ["aria-valuemax", "aria-valuemin", "aria-valuenow"],
    supports: ["aria-orientation", "aria-readonly"],
    name: {
      from: ["author"],
      required: true,
    },
    implicits: [
      ["aria-orientation", "horizontal"],
      ["aria-valuemin", "0"],
      ["aria-valuemax", "100"],
      ["aria-valuenow", "50"],
    ],
  })
);
