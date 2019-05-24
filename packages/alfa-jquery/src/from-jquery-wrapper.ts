import {
  Document,
  DocumentType,
  Element,
  NodeType
} from "@siteimprove/alfa-dom";
import { JQueryWrapper } from "./types";

const documentType: DocumentType = {
  nodeType: NodeType.DocumentType,
  publicId: "",
  systemId: "",
  name: "html",
  childNodes: []
};

export function fromJQueryWrapper<T>(
  jQueryWrapper: JQueryWrapper
): Document | Element {
  if (jQueryWrapper.length === 1) {
    return jQueryWrapper.get(0);
  }

  return {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: [documentType, ...jQueryWrapper.get()]
  };
}
