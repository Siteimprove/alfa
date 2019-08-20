import { Style } from "../../style";

export function getRootStyle<S>(style: Style<S>): Style<S> {
  while (style.parent !== null) {
    style = style.parent;
  }

  return style;
}
