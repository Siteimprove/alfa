import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowheader
 */
Role.register(
  Role.of("rowheader", Role.Category.Structure, {
    inherits: ["cell", "gridcell", "sectionhead"],
    supports: ["aria-sort"],
    context: ["row"],
    name: {
      from: ["contents", "author"],
      required: true
    }
  })
);
