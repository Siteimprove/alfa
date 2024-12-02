import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is repeat", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          values: [
            {
              type: "keyword",
              value: "repeat",
            },
          ],
          separator: " ",
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["repeat-x", "repeat-y"] as const) {
    const element = <div style={{ maskRepeat: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-repeat").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "keyword",
            value: kw,
          },
        ],
      },
      source: h.declaration("mask-repeat", kw).toJSON(),
    });
  }

  for (const kw of ["repeat", "space", "round", "no-repeat"] as const) {
    const element = <div style={{ maskRepeat: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-repeat").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "list",
            separator: " ",
            values: [
              {
                type: "keyword",
                value: kw
              }
            ],
          },
        ],
      },
      source: h.declaration("mask-repeat", kw).toJSON(),
    });
  }
});

test("#computed parses at most two space separated values", (t) => {
  const element1 = <div style={{ maskRepeat: "repeat space" }}></div>;
  const style1 = Style.from(element1, device);
  t.deepEqual(style1.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "repeat",
            },
            {
              type: "keyword",
              value: "space",
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-repeat", "repeat space").toJSON(),
  });

  const element2 = <div style={{ maskRepeat: "repeat space round" }}></div>;
  const style2 = Style.from(element2, device);
  t.deepEqual(style2.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "repeat",
            },
          ],
        },
      ],
    },
    source: null,
  });
});

test("#computed parses mutiple layers", (t) => {
  const element = <div style={{ maskImage: "url(foo.svg), url(bar.svg)", maskRepeat: "round repeat, space" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "round"
            },
            {
              type: "keyword",
              value: "repeat"
            }
          ],
        },
        {
          type: "list",
          separator: " ",
          values: [
            {

              type: "keyword",
              value: "space"
            }
          ]
        }
      ],
    },
    source: h.declaration("mask-repeat", "round repeat, space").toJSON(),
  });
});

test("#computed discards excess values when there are more values than layers", (t) => {
  const element = <div style={{ maskImage: "url(foo.svg)", maskRepeat: "round repeat, space" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "round"
            },
            {
              type: "keyword",
              value: "repeat"
            }
          ],
        },
      ],
    },
    source: h.declaration("mask-repeat", "round repeat, space").toJSON(),
  });
});

test("#computed repeats values when there are more layers than values", (t) => {
  const element = <div style={{ maskImage: "url(foo.svg), url(bar.svg), url(baz.svg)", maskRepeat: "round repeat, space" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-repeat").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "round"
            },
            {
              type: "keyword",
              value: "repeat"
            }
          ],
        },
        {
          type: "list",
          separator: " ",
          values: [
            {

              type: "keyword",
              value: "space"
            }
          ]
        },
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "round"
            },
            {
              type: "keyword",
              value: "repeat"
            }
          ],
        },
      ],
    },
    source: h.declaration("mask-repeat", "round repeat, space").toJSON(),
  });
});
