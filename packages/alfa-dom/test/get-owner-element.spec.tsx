import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getOwnerElement } from "../src/get-owner-element";
import { Attribute } from "../src/types";

test("Returns owner element of attribute", t => {
  const div1 = <div aria-label="foo" />;
  const strong = <strong />;
  const div2 = <div aria-label="bar" />;
  const att: Attribute = div2.attributes[0];
  const body = (
    <body>
      {div1}
      foo
      {strong}
      {div2}
    </body>
  );

  t.equal(getOwnerElement(att, body), div2);
});

test("Returns null when owner element is not present in the passed context", t => {
  const div1 = <div aria-label="foo" />;
  const strong = <strong />;
  const div2 = <div aria-label="bar" />;
  const att: Attribute = div2.attributes[0];
  const body = (
    <body>
      {div1}
      foo
      {strong}
    </body>
  );

  t.equal(getOwnerElement(att, body), null);
});
