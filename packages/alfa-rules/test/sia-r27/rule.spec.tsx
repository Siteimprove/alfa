import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R27, { Outcomes } from "../../src/sia-r27/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when R22 passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R22
        "has-captions": true,
      })
    ),
    [passed(R27, target, { 1: Outcomes.HasTextAlternative })]
  );
});

test(`evaluate() passes when R31 passes`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R31
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [passed(R27, target, { 1: Outcomes.HasTextAlternative })]
  );
});

test(`evaluate() fails when all input rules fail`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R22
        "has-captions": false,
        // R31
        "text-alternative": None,
        label: None,
      })
    ),
    [failed(R27, target, { 1: Outcomes.HasNoTextAlternative })]
  );
});

test(`evaluate() cannot tell if no input rule can tell`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [cantTell(R27, target)]
  );
});

test(`evaluate() cannot tell when some input rule cannot tell and no input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R22
        "has-captions": false,
        // R31
      })
    ),
    [cantTell(R27, target)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R27, { document }), [inapplicable(R27)]);
});

test(`evaluate() is inapplicable to videos without audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R27,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [inapplicable(R27)]
  );
});
