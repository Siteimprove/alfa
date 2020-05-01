import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#tablist
 */
Role.register(
  Role.of("tablist", Role.Category.Widget, {
    inherits: ["composite"],
    supports: ["aria-level", "aria-multiselectable", "aria-orientation"],
    owns: ["tab"],
    name: {
      from: ["author"],
      required: false,
    },
    implicits: [["aria-orientation", "horizontal"]],
  })
);
