import {
  AttributePointer,
  DocumentPointer,
  ElementPointer,
  Pointer,
  PointerType
} from "./types";

export function isDocumentPointer(
  pointer: Pointer<unknown>
): pointer is DocumentPointer<unknown> {
  return pointer.type === PointerType.Document;
}

export function isElementPointer(
  pointer: Pointer<unknown>
): pointer is ElementPointer<unknown> {
  return pointer.type === PointerType.Element;
}

export function isAttributePointer(
  pointer: Pointer<unknown>
): pointer is AttributePointer<unknown> {
  return pointer.type === PointerType.Attribute;
}
