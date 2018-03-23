const { keys } = Object;

export type State = "default" | "focus";

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

export type Style = { [P in Property]?: string };

export const properties: Array<Property> = [];

for (const name in keys(PropertyName)) {
  const property = PropertyName[name];

  if (property !== undefined) {
    properties[name] = property as Property;
  }
}
