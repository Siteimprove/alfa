import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#tree
 */
Role.register(
  Role.of("tree", Role.Category.Widget, {
    inherits: ["select"],
    owns: ["TreeItem", ["Group", "TreeItem"]],
    supports: ["aria-Multiselectable", "aria-Required"],
    name: {
      from: ["author"],
      required: true,
    },
    implicits: [["aria-Orientation", "vertical"]],
  })
);
