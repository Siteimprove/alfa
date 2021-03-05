import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `border-block-end-color: red`", (t) => {
  const element = <div style={{ borderBlockEndColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-end-color").get().toJSON(), {
    value: {
      format: "named",
      type: "color",
      color: "red",
    },
    source: h.declaration("border-block-end-color", "red").toJSON(),
  });
});

test("#computed() resolves `border-block-end-color: red`", (t) => {
  const element = <div style={{ borderBlockEndColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-block-end-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: {
        type: "percentage",
        value: 1,
      },
      green: {
        type: "percentage",
        value: 0,
      },
      blue: {
        type: "percentage",
        value: 0,
      },
      alpha: {
        type: "percentage",
        value: 1,
      },
    },
    source: h.declaration("border-block-end-color", "red").toJSON(),
  });
});

test("#cascaded() parses `border-block-end-style: dotted`", (t) => {
  const element = <div style={{ borderBlockEndStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-end-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-block-end-style", "dotted").toJSON(),
  });
});

test("#cascaded() parses `border-block-end-width: medium`", (t) => {
  const element = <div style={{ borderBlockEndWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-end-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-block-end-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-block-end-width: 1.2em`", (t) => {
  const element = <div style={{ borderBlockEndWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-end-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-block-end-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-block-end-width: 1.2em; border-block-end-style: none`", (t) => {
  const element = (
    <div
      style={{ borderBlockEndWidth: "1.2em", borderBlockEndStyle: "none" }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-block-end-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});

test("#cascaded() parses `border-block-end-color: red`", (t) => {
  const element = <div style={{ borderBlockEndColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-end-color").get().toJSON(), {
    value: {
      format: "named",
      type: "color",
      color: "red",
    },
    source: h.declaration("border-block-end-color", "red").toJSON(),
  });
});

test("#computed() resolves `border-block-end-color: red`", (t) => {
  const element = <div style={{ borderBlockEndColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-block-end-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: {
        type: "percentage",
        value: 1,
      },
      green: {
        type: "percentage",
        value: 0,
      },
      blue: {
        type: "percentage",
        value: 0,
      },
      alpha: {
        type: "percentage",
        value: 1,
      },
    },
    source: h.declaration("border-block-end-color", "red").toJSON(),
  });
});

test("#cascaded() parses `border-block-start-style: dotted`", (t) => {
  const element = <div style={{ borderBlockStartStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-start-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-block-start-style", "dotted").toJSON(),
  });
});

test("#cascaded() parses `border-block-start-width: medium`", (t) => {
  const element = <div style={{ borderBlockStartWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-start-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-block-start-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-block-start-width: 1.2em`", (t) => {
  const element = <div style={{ borderBlockStartWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-block-start-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-block-start-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-block-start-width: 1.2em; border-block-start-style: none`", (t) => {
  const element = (
    <div
      style={{ borderBlockStartWidth: "1.2em", borderBlockStartStyle: "none" }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-block-start-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});

test("#cascaded() parses `border-bottom-color: red`", (t) => {
  const element = <div style={{ borderBottomColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-bottom-color").get().toJSON(), {
    value: {
      format: "named",
      type: "color",
      color: "red",
    },
    source: h.declaration("border-bottom-color", "red").toJSON(),
  });
});

test("#computed() resolves `border-bottom-color: red`", (t) => {
  const element = <div style={{ borderBottomColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-bottom-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: {
        type: "percentage",
        value: 1,
      },
      green: {
        type: "percentage",
        value: 0,
      },
      blue: {
        type: "percentage",
        value: 0,
      },
      alpha: {
        type: "percentage",
        value: 1,
      },
    },
    source: h.declaration("border-bottom-color", "red").toJSON(),
  });
});

// TODO
// test("#cascaded() parses `border-bottom-left-radius: 10px 10%`", (t) => {
//   const element = <div style={{ borderBottomLeftRadius: "10px 10%" }}></div>;

//   const style = Style.from(element, device);

//   t.deepEqual(style.cascaded("border-bottom-left-radius").get().toJSON(), {
//     value: {
//       type: "length",
//       unit: "em",
//       value: 1.2,
//     },
//     source: h.declaration("border-bottom-left-radius", "10px 10%").toJSON(),
//   });
// });

test("#cascaded() parses `border-bottom-style: dotted`", (t) => {
  const element = <div style={{ borderBottomStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-bottom-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-bottom-style", "dotted").toJSON(),
  });
});

test("#cascaded() parses `border-bottom-width: medium`", (t) => {
  const element = <div style={{ borderBottomWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-bottom-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-bottom-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-bottom-width: 1.2em`", (t) => {
  const element = <div style={{ borderBottomWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-bottom-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-bottom-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-bottom-width: 1.2em; border-block-end-style: none`", (t) => {
  const element = (
    <div
      style={{ borderBottomWidth: "1.2em", borderBottomStyle: "none" }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-bottom-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});
test("#cascaded() parses `border-left-style: dotted`", (t) => {
  const element = <div style={{ borderLeftStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-left-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-left-style", "dotted").toJSON(),
  });
});

test("#cascaded() parses `border-left-width: medium`", (t) => {
  const element = <div style={{ borderLeftWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-left-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-left-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-left-width: 1.2em`", (t) => {
  const element = <div style={{ borderLeftWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-left-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-left-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-left-width: 1.2em; border-block-end-style: none`", (t) => {
  const element = (
    <div style={{ borderLeftWidth: "1.2em", borderLeftStyle: "none" }}></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-left-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});

test("#cascaded() parses `border-right-style: dotted`", (t) => {
  const element = <div style={{ borderRightStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-right-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-right-style", "dotted").toJSON(),
  });
});
test("#cascaded() parses `border-right-width: medium`", (t) => {
  const element = <div style={{ borderRightWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-right-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-right-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-right-width: 1.2em`", (t) => {
  const element = <div style={{ borderRightWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-right-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-right-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-right-width: 1.2em; border-block-end-style: none`", (t) => {
  const element = (
    <div style={{ borderRightWidth: "1.2em", borderRightStyle: "none" }}></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-right-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});

test("#cascaded() parses `border-top-style: dotted`", (t) => {
  const element = <div style={{ borderTopStyle: "dotted" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-top-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "dotted",
    },
    source: h.declaration("border-top-style", "dotted").toJSON(),
  });
});

test("#cascaded() parses `border-top-width: medium`", (t) => {
  const element = <div style={{ borderTopWidth: "medium" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-top-width").get().toJSON(), {
    value: {
      type: "keyword",
      value: "medium",
    },
    source: h.declaration("border-top-width", "medium").toJSON(),
  });
});

test("#cascaded() parses `border-top-width: 1.2em`", (t) => {
  const element = <div style={{ borderTopWidth: "1.2em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-top-width").get().toJSON(), {
    value: {
      type: "length",
      unit: "em",
      value: 1.2,
    },
    source: h.declaration("border-top-width", "1.2em").toJSON(),
  });
});

test("#computed() resolves `border-top-width: 1.2em; border-block-end-style: none`", (t) => {
  const element = (
    <div style={{ borderTopWidth: "1.2em", borderTopStyle: "none" }}></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("border-top-width").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 0,
    },
    // TODO: Is this correct?
    source: null,
  });
});
