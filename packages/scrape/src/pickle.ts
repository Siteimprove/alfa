import { stringify } from "circular-json";
import { virtualize } from "@alfa/pickle";

export function pickle(): string {
  return stringify(
    virtualize(window.document, {
      style: true,
      layout: true
    })
  );
}
