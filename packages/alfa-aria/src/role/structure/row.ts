import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#row
 */
Role.register(
  Role.of("row", Role.Category.Structure, {
    inherits: ["widget", "group"],
    supports: ["aria-colindex", "aria-level", "aria-rowindex", "aria-selected"],
    context: ["grid", "rowgroup", "table", "treegrid"],
    owns: ["cell", "columnheader", "gridcell", "rowheader"],
    name: {
      from: ["contents", "author"],
      required: false
    }
  })
);
