import { virtualize, layout, style, dereference } from "@alfa/pickle";

export function pickle(): object {
  const document = virtualize(window.document, {
    parents: false,
    references: true
  });

  layout(document);
  style(document);

  dereference(document);

  return document;
}
