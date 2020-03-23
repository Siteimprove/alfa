import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#columnheader
 */
Role.register(
  Role.of("columnheader", Role.Category.Structure, {
    inherits: ["cell", "gridcell", "sectionhead"],
    supports: ["aria-sort"],
    context: ["row"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
  })
);
