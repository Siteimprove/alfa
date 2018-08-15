import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAttribute } from "../src/get-attribute";

test("Get Attribute Value when Defined", t => {
  const foo = <div aria-labelledby="foobar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby"), "foobar");
});

test("Get Attribute Value when not Defined", t => {
  const foo = <div>Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby"), null);
});

test("Get Attribute Value when Defined and Trim=true", t => {
  const foo = <div aria-labelledby="  foobar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby", { trim: true }), "foobar");
});

test("Get Attribute Value when Defined and LowerCase=true", t => {
  const foo = <div aria-labelledby="fooBar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby", { lowerCase: true }), "foobar");
});
