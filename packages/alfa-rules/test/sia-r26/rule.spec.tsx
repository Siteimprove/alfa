import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R26 from "../../src/sia-r26/rule";
import { Outcomes } from "../../src/common/expectation/media-text-alternative";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes a video that is labelled as alternative for text`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [
      passed(
        R26,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<video>"),
          2: Outcomes.HasPerceivableLabel("<video>"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails a video that is not alternative for text`, async (t) => {
  const target = <video src="foo.mp4" />;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([label, target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "text-alternative": None,
        label: Option.of(label),
      })
    ),
    [
      failed(
        R26,
        target,
        {
          1: Outcomes.HasNoAlternative("<video>"),
          2: Outcomes.HasPerceivableLabel("<video>"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails a video that is not labelled as alternative for text`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;

  const document = h.document([text, target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "text-alternative": Option.of(text),
        label: None,
      })
    ),
    [
      failed(
        R26,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<video>"),
          2: Outcomes.HasNoLabel("<video>"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails a video alternative for invisible text`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p style={{ visibility: "hidden" }}>Some very long text</p>;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [
      failed(
        R26,
        target,
        {
          1: Outcomes.HasNonPerceivableAlternative("<video>"),
          2: Outcomes.HasPerceivableLabel("<video>"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails a video that is invisibly labelled as alternative for text`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;
  const label = (
    <span style={{ visibility: "hidden" }}>Watch this content as a video</span>
  );

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [
      failed(
        R26,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<video>"),
          2: Outcomes.HasNonPerceivableLabel("<video>"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [cantTell(R26, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R26, { document }), [inapplicable(R26)]);
});

test(`evaluate() is inapplicable to videos with audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R26,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [inapplicable(R26, Outcome.Mode.SemiAuto)]
  );
});
