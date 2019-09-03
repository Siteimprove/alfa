import {
  clone,
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
    return clone(jQueryWrapper.get(0));
  }

  return {
    nodeType: NodeType.Document,
    styleSheets: [],
    childNodes: [documentType, ...jQueryWrapper.get()].map(clone)
  };
}
