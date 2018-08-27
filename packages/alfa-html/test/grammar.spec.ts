import {
  Comment,
  Document,
  DocumentType,
  NodeType
} from "@siteimprove/alfa-dom";
import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../src/alphabet";
import { Grammar } from "../src/grammar";

function html(t: Assertions, input: string, expected: Document | null) {
  t.deepEqual(parse(lex(input, Alphabet), Grammar), expected, input);
}

test("Can parse an empty document", t => {
  html(t, "", null);
});

test("Can parse a document with a doctype", t => {
  const doctype: DocumentType = {
    nodeType: NodeType.DocumentType,
    name: "html",
    childNodes: []
  };

  html(t, "<!doctype html>", {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    childNodes: [doctype],
    styleSheets: []
  });
});

test("Can parse a document with a comment", t => {
  const comment: Comment = {
    nodeType: NodeType.Comment,
    data: "foo",
    childNodes: []
  };

  html(t, "<!--foo-->", {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    childNodes: [comment],
    styleSheets: []
  });
});
