import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";

import { Node } from "../src/node";

const document = Document.fromDocument({
  type: "document",
  style: [],
  children: [<span aria-hidden="true">Hello world</span>]
});

for (const [node] of Node.from(document, Device.getDefaultDevice())) {
  console.dir(node, { depth: null });
}
