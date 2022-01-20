import { jsx as _jsx } from "./jsx";

import { Element } from ".";

export import JSX = _jsx.JSX;

/**
 * @public
 */
export function jsx<N extends string = string>(
  name: N,
  properties: _jsx.Properties & { children?: _jsx.Child }
): Element<N> {
  const { children, ...rest } = properties;

  if (children === undefined) {
    return _jsx(name, rest);
  } else {
    return _jsx(name, rest, children);
  }
}

/**
 * @public
 */
export function jsxs<N extends string = string>(
  name: N,
  properties: _jsx.Properties & { children?: _jsx.Children }
): Element<N> {
  const { children, ...rest } = properties;

  if (children === undefined) {
    return _jsx(name, rest);
  } else {
    return _jsx(name, rest, ...children);
  }
}

/**
 * @public
 */
export function jsxDEV<N extends string = string>(
  name: N,
  properties: _jsx.Properties & { children?: _jsx.Child | _jsx.Children }
): Element<N> {
  const { children, ...rest } = properties;

  if (children === undefined) {
    return _jsx(name, rest);
  } else if (Array.isArray(children)) {
    return _jsx(name, rest, ...children);
  } else {
    return _jsx(name, rest, children);
  }
}
