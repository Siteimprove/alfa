import { test } from "@siteimprove/alfa-test";
import { parseDeclaration, parseRule, parseSelector } from "../src/parse";

test("Can parse a declaration", t => {
  t.deepEqual(parseDeclaration("text-color: #000 !important;"), [
    {
      name: "text-color",
      value: [
        {
          type: 10
        },
        {
          type: 3,
          unrestricted: true,
          value: "000"
        },
        {
          type: 10
        }
      ],
      important: true
    }
  ]);
});

test("Can parse a rule", t => {
  t.deepEqual(parseRule("b { text-decoration: none; }"), {
    prelude: [
      {
        type: 0,
        value: "b"
      },
      {
        type: 10
      }
    ],
    value: [
      {
        type: 10
      },
      {
        type: 0,
        value: "text-decoration"
      },
      {
        type: 11
      },
      {
        type: 10
      },
      {
        type: 0,
        value: "none"
      },
      {
        type: 12
      },
      {
        type: 10
      }
    ]
  });
});

test("Cannot parse a gibberish rule", t => {
  t.deepEqual(parseRule("{ text-decoration: none; }"), null);
});

test("Can parse a selector", t => {
  t.deepEqual(parseSelector("#foo"), {
    type: 1,
    name: "foo"
  });
});
