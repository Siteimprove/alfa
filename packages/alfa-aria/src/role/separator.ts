import { Role } from "../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#separator
 */
Role.register(
  Role.of("separator", Role.Category.Widget, {
    inherits: ["widget"],
    supports: [
      "aria-orientation",
      "aria-valuemax",
      "aria-valuemin",
      "aria-valuenow",
      "aria-valuetext"
    ],
    name: {
      from: ["author"],
      required: false
    },
    implicits: [
      ["aria-orientation", "horizontal"],
      ["aria-valuemin", "0"],
      ["aria-valuemax", "100"],
      ["aria-valuenow", "50"]
    ]
  })
);
