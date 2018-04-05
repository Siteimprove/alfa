import { stringify } from "circular-json";
import { virtualize, Sheets } from "@alfa/pickle";

export function pickle(): string {
  const sheets: Sheets = { style: [], layout: [] };

  const document = virtualize(window.document, sheets);

  return stringify({ document, ...sheets });
}
