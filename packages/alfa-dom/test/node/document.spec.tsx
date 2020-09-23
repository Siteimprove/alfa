import { jsx } from "../../src/jsx";
import { test } from "@siteimprove/alfa-test";
import { Document, h } from "../../src";

test("equals(_, true) tests structural equality", (t) => {
  const document1 = Document.of([
    <html>
      <div>
        <span>Foo</span>
        <span>Bar</span>
      </div>
    </html>,
  ]);
  const document2 = Document.of([
    <html>
      <div>
        <span>Foo</span>
        <span>Bar</span>
      </div>
    </html>,
  ]);

  t.deepEqual(document1.equals(document2), false);
  t.deepEqual(document1.equals(document2, true), true);
});
