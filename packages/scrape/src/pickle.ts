import { virtualize } from "@alfa/pickle";

export function pickle(): object {
  return virtualize(window.document, {
    parents: false,
    references: false,
    style: true,
    layout: true
  });
}
