import { Role } from "../../types";
import { Alert } from "../live-region";
import { Dialog } from "../window";

/**
 * @see https://www.w3.org/TR/wai-aria/#alertdialog
 */
export const AlertDialog: Role = {
  name: "alertdialog",
  inherits: [Alert, Dialog],
  label: { from: ["author"], required: true }
};
