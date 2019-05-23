import { Document, Node, NodeType } from "@siteimprove/alfa-dom";

export function documentFromNodes(nodes: Array<Node>): Document {
  return {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: nodes
  };
}
