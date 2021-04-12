import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";
import { Serializable } from "@siteimprove/alfa-json";

import * as Outset from "../../src/property/border-image-outset";
import * as Slice from "../../src/property/border-image-slice";
import * as Width from "../../src/property/border-image-width";

import { Style } from "../../src/style";

const device = Device.standard();

function fourLength(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Serializable.ToJSON<Outset.Specified> &
  Serializable.ToJSON<Width.Specified> {
  return {
    type: "tuple",
    values: [
      {
        type: "length",
        value: top,
        unit: "px",
      },
      {
        type: "length",
        value: right ?? top,
        unit: "px",
      },
      {
        type: "length",
        value: bottom ?? top,
        unit: "px",
      },
      {
        type: "length",
        value: left ?? right ?? top,
        unit: "px",
      },
    ],
  };
}

function slice(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Serializable.ToJSON<Slice.Specified> {
  return {
    type: "tuple",
    values: [
      {
        type: "number",
        value: top,
      },
      {
        type: "number",
        value: right ?? top,
      },
      {
        type: "number",
        value: bottom ?? top,
      },
      {
        type: "number",
        value: left ?? right ?? top,
      },
    ],
  };
}

test(`#cascaded() parses \`border-image: url(foo.png)\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-image", "url(foo.png)");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-source").get().toJSON(), {
    value: {
      type: "image",
      image: {
        type: "url",
        url: "foo.png",
      },
    },
    source: declaration.toJSON(),
  });
});

test(`#cascaded() parses \`border-image: url(foo.png) 27 23 / 50px 30px / 1px round space\``, (t) => {
  const element = <div />;
  const declaration = h.declaration(
    "border-image",
    "url(foo.png) 27 23 / 50px 30px / 1px round space"
  );

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-source").get().toJSON(), {
    value: {
      type: "image",
      image: {
        type: "url",
        url: "foo.png",
      },
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
    value: slice(27, 23),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: fourLength(50, 30),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: fourLength(1),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-repeat").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "space",
        },
      ],
    },
    source: declaration.toJSON(),
  });
});

test(`#cascaded() parses \`border-image: 27 23 / 50px 30px / 1px url(foo.png) round space\``, (t) => {
  const element = <div />;
  const declaration = h.declaration(
    "border-image",
    "27 23 / 50px 30px / 1px url(foo.png) round space"
  );

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-source").get().toJSON(), {
    value: {
      type: "image",
      image: {
        type: "url",
        url: "foo.png",
      },
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
    value: slice(27, 23),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: fourLength(50, 30),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: fourLength(1),
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("border-image-repeat").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "space",
        },
      ],
    },
    source: declaration.toJSON(),
  });
});
