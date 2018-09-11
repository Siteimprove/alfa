import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { contains } from "../src/contains";

test("Contains returns true when a node contains the specifed node using string query", t => {
  const strong = <strong />;
  const div = <div>{strong}</div>;

  t.equal(contains(div, <body>{div}</body>, "strong"), true);
});

test("Contains returns true when a node contains the specifed node using object query", t => {
  const strong = <strong />;
  const div = <div>{strong}</div>;

  t.equal(contains(div, <body>{div}</body>, strong), true);
});

test("Contains returns false when a node does not contain the specifed node using string query", t => {
  const div = <div />;

  t.equal(contains(div, <body>{div}</body>, "strong"), false);
});
