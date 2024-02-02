import { test } from "@siteimprove/alfa-test";

import { Diagnostic } from "../src/diagnostic";

test("#equals() returns true when messages are equal", (t) => {
  t.equal(Diagnostic.of("foo").equals(Diagnostic.of("foo")), true);
});

test("#equals() returns false when messages are not equal", (t) => {
  t.equal(Diagnostic.of("foo").equals(Diagnostic.of("bar")), false);
});

test("#equals() returns false when compared to a different type", (t) => {
  t.equal(Diagnostic.of("foo").equals(null), false);
});

test("Diagnostic.empty is a diagnostic with the message 'No extra information'", (t) => {
  t.equal(Diagnostic.empty.message, "No extra information");
});

test("#of() trims and collapses whitespace", (t) => {
  t.equal(Diagnostic.of("  foo    bar  ").message, "foo bar");
});
