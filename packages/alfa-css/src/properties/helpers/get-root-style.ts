import { Style } from "../../style";

export function getRootStyle(style: Style): Style {
  while (style.parent !== null) {
    style = style.parent;
  }

  return style;
}
