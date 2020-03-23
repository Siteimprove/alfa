import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#scrollbar
 */
Role.register(
  Role.of("scrollbar", Role.Category.Widget, {
    inherits: ["range"],
    requires: [
      "aria-controls",
      "aria-orientation",
      "aria-valuemax",
      "aria-valuemin",
      "aria-valuenow",
    ],
    name: {
      from: ["author"],
      required: false,
    },
    implicits: [
      ["aria-orientation", "vertical"],
      ["aria-valuemin", "0"],
      ["aria-valuemax", "100"],
      ["aria-valuenow", "50"],
    ],
  })
);
