import { Category, Role } from "../../types";
import { Alert } from "../live-region/alert";
import { Dialog } from "./dialog";

/**
 * @see https://www.w3.org/TR/wai-aria/#alertdialog
 */
export const AlertDialog: Role = {
  name: "alertdialog",
  category: Category.Window,
  inherits: () => [Alert, Dialog],
  label: { from: ["author"], required: true }
};
