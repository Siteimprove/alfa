import { Device } from "@siteimprove/alfa-device";
import { type Element, h, type Text } from "@siteimprove/alfa-dom";
import { type Assertions, test } from "@siteimprove/alfa-test";
import type { Style } from "../../../src";

import { hasSoftWrapOpportunity } from "../../../src/text/predicate/has-soft-wrap-opportunity.js";

const device = Device.standard();

function getSoftWrapOpportunity(element: Element): boolean {
  return hasSoftWrapOpportunity(device)(
    element.children().first().getUnsafe() as Text,
  );
}

function softWrapTest(
  style: {
    hyphens?: Style.Computed<"hyphens">["value"];
    wordBreak?: Style.Computed<"word-break">["value"];
    lineBreak?: Style.Computed<"line-break">["value"];
    overflowWrap?: Style.Computed<"overflow-wrap">["value"];
  },
  expected: {
    text: boolean;
    space: boolean;
    nbsp: boolean;
    zwsp: boolean;
    hyphen: boolean;
    comma: boolean;
    shy: boolean;
  },
): (t: Assertions) => void {
  return (t) => {
    const text = <span>Supercalifragilisticexpialidocious</span>;
    const space = <span>Supercalifragilistic expialidocious</span>;
    const nbsp = <span>Supercalifragilistic&nbsp;expialidocious</span>;
    // This could/should be a &ZeroWidthSpace; but JSX doesn't parse it (on purpose).
    // See https://facebook.github.io/jsx/#sec-HTMLCharacterReference
    const zwsp = <span>Supercali&#x200B;fragilisticexpialidocious</span>;
    const hyphen = <span>Super-califragilisticexpialidocious</span>;
    const comma = <span>Super,califragilisticexpialidocious</span>;
    const shy = <span>Super&shy;califragilisticexpialidocious</span>;

    h.document(
      [text, space, nbsp, zwsp, hyphen, comma, shy],
      [
        h.sheet([
          h.rule.style("span", {
            hyphens: style.hyphens ?? "initial",
            "word-break": style.wordBreak ?? "initial",
            "line-break": style.lineBreak ?? "initial",
            "overflow-wrap": style.overflowWrap ?? "initial",
          }),
        ]),
      ],
    );

    t.equal(
      getSoftWrapOpportunity(text),
      expected.text,
      `Text / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(space),
      expected.space,
      `Space / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(nbsp),
      expected.nbsp,
      `Non-breaking space / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(zwsp),
      expected.zwsp,
      `Zero-width space / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(hyphen),
      expected.hyphen,
      `Hyphen / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(comma),
      expected.comma,
      `Comma / ${JSON.stringify(style)}`,
    );
    t.equal(
      getSoftWrapOpportunity(shy),
      expected.shy,
      `Soft hyphen / ${JSON.stringify(style)}`,
    );
  };
}

const always = {
  text: true,
  space: true,
  nbsp: true,
  zwsp: true,
  hyphen: true,
  comma: true,
  shy: true,
};
const normal = {
  text: false,
  space: true,
  nbsp: false,
  zwsp: true,
  hyphen: true,
  comma: false,
  shy: true,
};

test("hasSoftWrapOpportunity() always break when any property allows it", (t) => {
  softWrapTest({ wordBreak: "break-all" }, always)(t);
  softWrapTest({ lineBreak: "anywhere" }, always)(t);
  softWrapTest({ overflowWrap: "break-word" }, always)(t);
  softWrapTest({ overflowWrap: "anywhere" }, always)(t);
  softWrapTest({ hyphens: "auto" }, always)(t);
});

test("hasSoftWrapOpportunity() breaks on explicit points in other cases", (t) => {
  for (const breakWord of [
    "normal",
    "keep-all",
    "manual",
    "auto-phrase",
  ] as const) {
    for (const lineBreak of ["auto", "normal", "loose", "strict"] as const) {
      softWrapTest(
        { wordBreak: breakWord, lineBreak, overflowWrap: "normal" },
        normal,
      )(t);
    }
  }
});
