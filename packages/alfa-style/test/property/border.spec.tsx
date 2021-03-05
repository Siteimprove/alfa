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
