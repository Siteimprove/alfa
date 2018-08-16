import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAttribute } from "../src/get-attribute";

test("Gets an attribute value when it is defined", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar">Foo</div>, "aria-labelledby"),
    "foobar"
  );
});

test("Gets an attribute value when it is not defined", t => {
  t.equal(getAttribute(<div>Foo</div>, "aria-labelledby"), null);
});

test("Gets an attribute balue when it is defined and trim=true", t => {
  t.equal(
    getAttribute(<div aria-labelledby="  foobar">Foo</div>, "aria-labelledby", {
      trim: true
    }),
    "foobar"
  );
});

test("Gets an attribute value when it is defined and lowercase=true", t => {
  t.equal(
    getAttribute(<div aria-labelledby="fooBar">Foo</div>, "aria-labelledby", {
      lowerCase: true
    }),
    "foobar"
  );
});
