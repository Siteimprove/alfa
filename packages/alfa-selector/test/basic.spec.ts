import { test } from "@siteimprove/alfa-test";

import { Attribute } from "../src";
import { serialize } from "./parser";

test(".parse() parses a type selector", (t) => {
  t.deepEqual(serialize("div"), {
    type: "type",
    name: "div",
    namespace: null,
  });
});

test(".parse() parses an uppercase type selector", (t) => {
  t.deepEqual(serialize("DIV"), {
    type: "type",
    name: "DIV",
    namespace: null,
  });
});

test(".parse() parses a type selector with a namespace", (t) => {
  t.deepEqual(serialize("svg|a"), {
    type: "type",
    name: "a",
    namespace: "svg",
  });
});

test(".parse() parses a type selector with an empty namespace", (t) => {
  t.deepEqual(serialize("|a"), {
    type: "type",
    name: "a",
    namespace: "",
  });
});

test(".parse() parses a type selector with the universal namespace", (t) => {
  t.deepEqual(serialize("*|a"), {
    type: "type",
    name: "a",
    namespace: "*",
  });
});

test(".parse() parses the universal selector", (t) => {
  t.deepEqual(serialize("*"), {
    type: "universal",
    namespace: null,
  });
});

test(".parse() parses the universal selector with an empty namespace", (t) => {
  t.deepEqual(serialize("|*"), {
    type: "universal",
    namespace: "",
  });
});

test(".parse() parses the universal selector with the universal namespace", (t) => {
  t.deepEqual(serialize("*|*"), {
    type: "universal",
    namespace: "*",
  });
});

test(".parse() parses a class selector", (t) => {
  t.deepEqual(serialize(".foo"), {
    type: "class",
    name: "foo",
  });
});

test(".parse() parses an ID selector", (t) => {
  t.deepEqual(serialize("#foo"), {
    type: "id",
    name: "foo",
  });
});

test(".parse() parses an attribute selector without a value", (t) => {
  t.deepEqual(serialize("[foo]"), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with an ident value", (t) => {
  t.deepEqual(serialize("[foo=bar]"), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a string value", (t) => {
  t.deepEqual(serialize('[foo="bar"]'), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a matcher", (t) => {
  t.deepEqual(serialize("[foo*=bar]"), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Attribute.Matcher.Substring,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a casing modifier", (t) => {
  t.deepEqual(serialize("[foo=bar i]"), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Attribute.Matcher.Equal,
    modifier: "i",
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(serialize("[foo|bar]"), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(serialize("[*|foo]"), {
    type: "attribute",
    name: "foo",
    namespace: "*",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(serialize("[|foo]"), {
    type: "attribute",
    name: "foo",
    namespace: "",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(serialize("[foo|bar=baz]"), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(serialize("[foo|bar|=baz]"), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Attribute.Matcher.DashMatch,
    modifier: null,
  });
});
