import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAttribute } from "../src/get-attribute";

test("Gets an attribute value when it is defined", t => {
  const foo = <div aria-labelledby="foobar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby"), "foobar");
});

test("Gets an attribute value when it is not defined", t => {
  const foo = <div>Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby"), null);
});

test("Gets an attribute balue when it is defined and trim=true", t => {
  const foo = <div aria-labelledby="  foobar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby", { trim: true }), "foobar");
});

test("Gets an attribute value when it is defined and lowercase=true", t => {
  const foo = <div aria-labelledby="fooBar">Foo</div>;
  t.equal(getAttribute(foo, "aria-labelledby", { lowerCase: true }), "foobar");
});
