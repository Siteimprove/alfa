import { test } from "@siteimprove/alfa-test";
import { Row } from "../src/row";
import { complexRow, simpleRow } from "./testcases";

test("Builder.from() processes individual rows", (t) => {
  t.deepEqual(
    Row.Builder.from(simpleRow.element).get().toJSON(),
    simpleRow.expected.toJSON()
  );

  t.deepEqual(
    Row.Builder.from(complexRow.element).get().toJSON(),
    complexRow.expected.toJSON()
  );
});
