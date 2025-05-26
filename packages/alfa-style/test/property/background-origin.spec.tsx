import { h } from "@siteimprove/alfa-dom/h";
import { xfail } from "@siteimprove/alfa-test";

import { computed } from "../common.js";

// https://github.com/Siteimprove/alfa/issues/1730
xfail(
  "#computed() repeats values to match number of layers determined by `background-image`",
  (t) => {
    t.deepEqual(
      computed(
        <div
          style={{
            backgroundImage: "url(flower.png), url(ball.png), url(grass.png)",
            backgroundOrigin: "border-box, content-box",
          }}
        ></div>,
        "background-origin",
      ),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [
            { type: "keyword", value: "border-box" },
            { type: "keyword", value: "content-box" },
            { type: "keyword", value: "border-box" },
          ],
        },
        source: h
          .declaration("background-origin", "border-box, content-box")
          .toJSON(),
      },
    );
  },
);

// https://github.com/Siteimprove/alfa/issues/1730
xfail(
  "#computed() discards excess values to match number of layers determined by `background-image`",
  (t) => {
    t.deepEqual(
      computed(
        <div
          style={{
            backgroundImage: "url(flower.png), url(ball.png), url(grass.png)",
            backgroundOrigin:
              "border-box, content-box, border-box, content-box",
          }}
        ></div>,
        "background-origin",
      ),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [
            { type: "keyword", value: "border-box" },
            { type: "keyword", value: "content-box" },
            { type: "keyword", value: "border-box" },
          ],
        },
        source: h
          .declaration(
            "background-origin",
            "border-box, content-box, border-box, content-box",
          )
          .toJSON(),
      },
    );
  },
);
