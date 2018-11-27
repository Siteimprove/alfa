import { Device } from "@siteimprove/alfa-device";
import { concat, keys, Mutable } from "@siteimprove/alfa-util";

import {
  CascadedPropertyValue,
  ComputedPropertyValue,
  SpecifiedPropertyValue
} from "./properties";
import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";

import { TokenType } from "./alphabet";
import { Declaration } from "./types";
import { Values } from "./values";

type Longhands = typeof Longhands;
type Shorthands = typeof Shorthands;

export type CascadedStyle = {
  readonly [N in keyof Longhands]?: CascadedPropertyValue<N>
};

export type SpecifiedStyle = {
  readonly [N in keyof Longhands]?: SpecifiedPropertyValue<N>
};

export type ComputedStyle = {
  readonly [N in keyof Longhands]?: ComputedPropertyValue<N>
};

export interface Style {
  readonly parent: Style | null;

  readonly cascaded: CascadedStyle;
  readonly specified: SpecifiedStyle;
  readonly computed: ComputedStyle;
}

export interface StyleEntry<T> {
  readonly target: T;

  readonly declarations: ReadonlyArray<Declaration>;

  readonly children: ReadonlyArray<StyleEntry<T>>;
}

export class StyleTree<T extends object> {
  // private readonly root: StyleTreeEntry;
  // private readonly device: Device;

  private readonly styles = new WeakMap<T, Style>();

  public constructor(root: StyleEntry<T>, device: Device) {
    // this.root = root;
    // this.device = device;

    visit(root, null, (entry, parentEntry) => {
      const { declarations } = entry;

      const parent =
        parentEntry === null ? null : this.styles.get(parentEntry.target)!;

      const style = {
        parent,
        cascaded: {},
        specified: {},
        computed: {}
      };

      style.cascaded = resolveCascadedStyle(declarations);
      style.specified = resolveSpecifiedStyle(style);
      style.computed = resolveComputedStyle(style, device);

      this.styles.set(entry.target, style);
    });
  }

  public get(target: T): Style | null {
    const style = this.styles.get(target);

    if (style === undefined) {
      return null;
    }

    return style;
  }
}

function visit<T extends object>(
  entry: StyleEntry<T>,
  parentEntry: StyleEntry<T> | null,
  visitor: (entry: StyleEntry<T>, parentEntry: StyleEntry<T> | null) => void
): void {
  visitor(entry, parentEntry);

  for (const child of entry.children) {
    visit(child, entry, visitor);
  }
}

function resolveCascadedStyle(
  declarations: ReadonlyArray<Declaration>
): CascadedStyle {
  const cascadedStyle: Mutable<CascadedStyle> = {};

  const setProperty: <N extends keyof Longhands>(
    propertyName: N,
    propertyValue: CascadedPropertyValue<N>,
    important: boolean
  ) => void = (propertyName, propertyValue, important) => {
    if (propertyName in cascadedStyle === false || important) {
      cascadedStyle[propertyName] = propertyValue;
    }
  };

  outer: for (const { name, value, important } of declarations) {
    const propertyName = getPropertyName(name);

    if (propertyName === null) {
      continue;
    }

    for (let i = 0, n = value.length; i < n; i++) {
      const token = value[i];

      if (token.type === TokenType.Whitespace) {
        continue;
      }

      if (token.type === TokenType.Ident) {
        switch (token.value) {
          case "initial":
          case "inherit":
            const value = Values.keyword(token.value);

            if (isLonghandPropertyName(propertyName)) {
              setProperty(propertyName, value, important);
            } else {
              const { longhands } = Shorthands[propertyName];

              for (const propertyName of longhands) {
                setProperty(propertyName, value, important);
              }
            }

            continue outer;
        }
      }

      break;
    }

    if (isLonghandPropertyName(propertyName)) {
      const property = Longhands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        setProperty(propertyName, result, important);
      }
    } else {
      const property = Shorthands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        for (const propertyName of keys(result)) {
          const value = result[propertyName];

          if (value !== undefined) {
            setProperty(propertyName, value, important);
          }
        }
      }
    }
  }

  return cascadedStyle;
}

const propertyNames = new Map<string, keyof Longhands | keyof Shorthands>();

for (const propertyName of concat(keys(Longhands), keys(Shorthands))) {
  propertyNames.set(
    propertyName.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`),
    propertyName
  );
}

function getPropertyName(
  input: string
): keyof Longhands | keyof Shorthands | null {
  const propertyName = propertyNames.get(input);

  if (propertyName === undefined) {
    return null;
  }

  return propertyName;
}

function isLonghandPropertyName(
  propertyName: keyof Longhands | keyof Shorthands
): propertyName is keyof Longhands {
  return propertyName in Longhands;
}

function resolveSpecifiedStyle(style: Style): SpecifiedStyle {
  const specifiedStyle: Mutable<SpecifiedStyle> = {};

  const cascadedStyle = style.cascaded;

  const parentStyle = style.parent === null ? {} : style.parent.computed;

  const propertyNames = new Set([...keys(cascadedStyle), ...keys(parentStyle)]);

  for (const propertyName of propertyNames) {
    const property = Longhands[propertyName];

    if (cascadedStyle[propertyName] !== undefined) {
      const cascadedValue = cascadedStyle[propertyName]!;

      if (Values.isKeyword(cascadedValue, "initial", "inherit")) {
        if (
          Values.isKeyword(cascadedValue, "inherit") &&
          propertyName in parentStyle
        ) {
          specifiedStyle[propertyName] = parentStyle[propertyName]!;
        } else {
          specifiedStyle[propertyName] = property.initial();
        }
      } else {
        specifiedStyle[propertyName] = cascadedValue;
      }

      continue;
    }

    if (property.inherits === true && parentStyle[propertyName] !== undefined) {
      specifiedStyle[propertyName] = parentStyle[propertyName]!;
    } else {
      specifiedStyle[propertyName] = property.initial();
    }
  }

  return specifiedStyle;
}

export function resolveComputedStyle(
  style: Style,
  device: Device
): ComputedStyle {
  const computedStyle: Mutable<ComputedStyle> = {};

  const specifiedStyle = style.specified;

  const parentStyle = style.parent === null ? {} : style.parent.computed;

  const propertyNames = new Set([
    ...keys(specifiedStyle),
    ...keys(parentStyle)
  ]);

  function setProperty<N extends keyof Longhands>(propertyName: N): void {
    const property = Longhands[propertyName];

    if (computedStyle[propertyName] !== undefined) {
      return;
    }

    if (property.depends !== undefined) {
      for (const propertyName of property.depends) {
        if (propertyName in propertyNames) {
          setProperty(propertyName);
        }
      }
    }

    computedStyle[propertyName] = property.computed(style, device);
  }

  for (const propertyName of propertyNames) {
    setProperty(propertyName);
  }

  return computedStyle;
}
