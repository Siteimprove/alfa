import { Element } from "@alfa/dom";

const { keys } = Object;

export enum PropertyName {
  "display",
  "visibility",
  "color",
  "font-size",
  "text-indent",
  "background-color",
  "background-image",
  "outline-style",
  "outline-color",
  "outline-width"
}

export type Property = keyof typeof PropertyName;

export type Style = { readonly [P in Property]?: string };

export type StyleSheet = Array<{
  readonly element: Element;
  readonly style: Style;
}>;

export const Properties: Array<Property> = [];

for (const name in keys(PropertyName)) {
  const property = PropertyName[name];

  if (property !== undefined) {
    Properties[name] = property as Property;
  }
}
