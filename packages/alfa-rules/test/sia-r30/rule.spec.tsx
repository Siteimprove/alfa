import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R30, { Outcomes } from "../../src/sia-r30/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when R23 passes`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = <div>Hello</div>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        // R23
        transcript: Option.of(transcript),
      })
    ),
    [passed(R30, target, { 1: Outcomes.HasTextAlternative })]
  );
});

test(`evaluate() passes when R29 passes`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const text = <p>Some very long text</p>;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        // R29
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [passed(R30, target, { 1: Outcomes.HasTextAlternative })]
  );
});

test(`evaluate() fails when all input rules fail`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([target, label]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        // R23
        transcript: None,
        "transcript-link": None,
        // R29
        "text-alternative": None,
        label: Option.of(label),
      })
    ),
    [failed(R30, target, { 1: Outcomes.HasNoTextAlternative })]
  );
});

test(`evaluate() cannot tell if no input rule can tell`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({ "is-audio-streaming": false, "is-playing": true })
    ),
    [cantTell(R30, target)]
  );
});

test(`evaluate() cannot tell when some input rule cannot tell and no input rule passes`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        // R23
        transcript: None,
        "transcript-link": None,
        // R29
      })
    ),
    [cantTell(R30, target)]
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R30,
      { document },
      oracle({ "is-audio-streaming": false, "is-playing": true })
    ),
    [cantTell(R30, target)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R30, { document }), [inapplicable(R30)]);
});

test(`evaluate() is inapplicable to streaming audios`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(R30, { document }, oracle({ "is-audio-streaming": true })),
    [inapplicable(R30)]
  );
});
