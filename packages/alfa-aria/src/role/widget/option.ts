import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#option
 */
Role.register(
  Role.of("option", Role.Category.Widget, {
    inherits: ["input"],
    requires: ["aria-selected"],
    supports: ["aria-checked", "aria-positioninset", "aria-setsize"],
    context: ["listbox"],
    name: {
      from: ["contents", "author"],
      required: true
    },
    implicits: [["aria-selected", "false"]]
  })
);
