import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import { React } from "../src";

import { FunctionComponent } from "react";

const Button: FunctionComponent = ({ children }) => (
  <button className="btn">{children}</button>
);

test(`.toPage() creates an Alfa page`, (t) => {
  const actual = React.toPage(<Button />);

  const expected = Page.of(
    Request.empty(),
    Response.empty(),
    h.document([h.element("button", { class: "btn" })]),
    Device.standard()
  );

  t.deepEqual(actual.toJSON(), expected.toJSON());
});
