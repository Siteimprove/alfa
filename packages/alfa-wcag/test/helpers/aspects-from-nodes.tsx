import { Aspects } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-dom";
import { documentFromNodes } from "./document-from-nodes";

export function aspectsFromNodes(nodes: Array<Node>): Aspects {
  return {
    document: documentFromNodes(nodes),
    request: {
      method: "GET",
      url: "https://foo.bar/baz.html",
      headers: {}
    },
    response: {
      status: 200,
      headers: {},
      body: ""
    }
  };
}
