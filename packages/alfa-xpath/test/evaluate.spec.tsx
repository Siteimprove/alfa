import { h, Node } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { evaluate } from "../src/evaluate";

test("evaluate() should respect traversal options", (t) => {
  const div = (
    <div>
      <button />
      <iframe>
        {h.document([
          <html>
            <body>
              <button />
            </body>
          </html>,
        ])}
      </iframe>
      <div>
        {h.shadow([<button />, <button />, <slot />])}
        <button />
      </div>
      <button />
    </div>
  );

  t.equal([...evaluate(div, "//button")].length, 3);

  t.equal(
    [...evaluate(div, "//button", Node.Traversal.of(Node.Traversal.nested))]
      .length,
    4
  );

  t.equal(
    [...evaluate(div, "//button", Node.Traversal.of(Node.Traversal.composed))]
      .length,
    5
  );

  t.equal([...evaluate(div, "//button", Node.composedNested)].length, 6);
});
