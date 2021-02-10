import React from "react";

import { render } from "ink";

import { h } from "@siteimprove/alfa-dom/h";

import { Source } from "../src/component/source";

render(
  <Source
    source={h.document([
      h.type("html"),
      h(
        "html",
        [],
        [
          h(
            "body",
            {
              lang: "en",
            },
            [h("p", [], ["Hello world"])]
          ),
        ]
      ),
    ])}
  />
);
